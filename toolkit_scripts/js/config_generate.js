// This script combines the cleaner structure and logging of the "new script"
// with the full feature set of the "old script", including Altergen configuration
// and specific config file formatting.

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const http = require('http');

// env_for_apps=app,eshop
// app_env_vars=name,basichauth
// eshop_env_vars=name,basichauth


// Use the script's parent directory as the project root for robust path resolution.
const projectRoot = process.cwd();

// Regular expression for splitting comma or space-separated lists.
const REG_SPLIT = /[ ,]+/;

(async () => {
    console.log('Generating configuration...');

    let configs = {}; // separete configs for each app

    // --- 1. Find and Assign Free Ports ---
    const envMainPath = path.resolve(projectRoot, '.env.main');
    let envfileContent = fs.readFileSync(envMainPath, 'utf8');

    const count_of_external_port_0 = (envfileContent.match(/external_port=0/g) || []).length;

    if (count_of_external_port_0 > 0) {
        console.log(`Found ${count_of_external_port_0} services requesting a free port...`);
        for (let i = 0; i < count_of_external_port_0; i++) {
            const port = await findFreePort();
            console.log(` - Assigning port ${port}`);
            envfileContent = envfileContent.replace(`external_port=0`, `external_port=${port}`);
        }
        fs.writeFileSync(envMainPath, envfileContent);
    }

    // --- 2. Parse Environment Variables ---
    const envConfig = dotenv.parse(fs.readFileSync(envMainPath));
    const env = { ...envConfig };

    env['env_for_apps'] = splitArray(env['env_for_apps']) || [];

    // --- 3. Process App-Specific Configurations ---
    const apps = env['apps']?.split(REG_SPLIT)?.filter(app => app.trim() !== '');

    if (apps?.length > 0) {

        apps.forEach(app => {
            configs[app] = {};



            const domainsKey = `${app}_domains`;
            if (env[domainsKey]) {
                const domains = splitArray(env[domainsKey]);
                if (domains.length === 0) return;

                // Create Traefik domain rules
                env[`${app}_traefik_domains`] = "'" + domains.map(domain => `Host(\`${domain}\`)`).join(' || ') + "'";

                // Create Traefik redirect rules (restored from old script)
                if (env[`${app}_redirect_from_non_www`] === 'true') {
                    env[`${app}_traefik_redirect_to_www`] = "'" + domains.map(domain => `Host(\`${domain.replace('www.', '')}\`)`).join(' || ') + "'";
                } else {
                    // Fallback rule that will not match (restored from old script)
                    env[`${app}_traefik_redirect_to_www`] = "'Host(`" + domains[0] + "`) && PathPrefix(`/xxxxxxx`)'";
                }

                // Create Traefik basic auth and IP whitelist rules
                if (env[`${app}_basicauth`] === 'true') {
                    const ipwhitelist = splitArray(env[`${app}_basicauth_ipwhitelist`]);
                    env[`${app}_traefik_ipwhitelist`] = ipwhitelist.length > 0 ? "'" + ipwhitelist.map(ip => `ClientIP(\`${ip}\`)`).join(' || ') + "'" : "'!ClientIP(`0.0.0.0/0`)'";
                } else {
                    env[`${app}_traefik_ipwhitelist`] = "'ClientIP(`0.0.0.0/0`)'";
                }

                // Set primary domain and URL for the app
                env[`${app}_domain`] = domains[0];
                env[`${app}_url`] = `https://${domains[0]}`;
            }
            env[`docker_container_${app}`] = `${env.COMPOSE_PROJECT_NAME}_${app}`;

            // env
            if (env[`${app}_env_vars`] && env['env_for_apps'].includes(app)) {
                const envVars = splitArray(env[`${app}_env_vars`]);
                envVars.forEach(envVar => {
                    configs[app][envVar] = env[envVar];
                });

                Object.keys(env).forEach( key => {
                    if (key.startsWith(`${app}_`) ){
                        configs[app][key.replace(`${app}_`, '')] = env[key];
                    }   
                });
            }
        });



        // env
    }

    // --- 4. Configure Postgres Connection String ---
    if (env['postgres_user'] && env['postgres_password'] && env['postgres_db']) {
        env['docker_container_pg'] = env['COMPOSE_PROJECT_NAME'] + '_postgres';
        env['postgres'] = `${env['postgres_user']}:${env['postgres_password']}@${env['docker_container_pg']}/${env['postgres_db']}`;
    }

    // --- 5. Generate `config` and `.env` File Content ---

    let { configfile, envfile } = getAppConfigFile(configs);

    for (const app in configs) {
        if (env['env_for_apps'].includes(app)) {
            let { configfile, envfile } = getAppConfigFile(configs[app]);
            await fs.writeFileSync(path.resolve(projectRoot, `${app}/config`), configfile);
            await fs.writeFileSync(path.resolve(projectRoot, `${app}/.env`), envfile);
        }

    }

    // --- 6. Generate Altergen Configuration (restored from old script) ---
    const altergenOutputFile = env['altergen_output_file'];
    if (altergenOutputFile) {
        console.log('Generating altergen.json configuration...');
        const altergenConfig = {
            postgres: env['altergen_postgres'],
            source_dir: env['altergen_source_dir'],
            additional_source_dirs: splitArray(env['altergen_additional_source_dirs']),
            output_file: altergenOutputFile,
            drop_columns_file: env['altergen_drop_columns_file'],
            create_drop_columns_file: env['altergen_create_drop_columns_file'] === 'true',
            insert: env['altergen_insert'] === 'true',
            update: env['altergen_update'] === 'true',
            insert_if_not_exists: env['altergen_insert_if_not_exists'] === 'true'
        };

        // The old script built this object but never wrote it to a file.
        // This step is added based on the implied functionality.
        fs.writeFileSync(path.resolve(projectRoot, altergenOutputFile), JSON.stringify(altergenConfig, null, 4));
    }


    // --- 7. Write Final Configuration Files ---
    fs.writeFileSync(path.resolve(projectRoot, 'config'), configfile);
    fs.writeFileSync(path.resolve(projectRoot, '.env'), envfile);

    console.log('✅ Config file, .env, and altergen config generated successfully.');

})();

// --- Helper Functions ---

/**
 * Finds an available TCP port on the local machine.
 * @returns {Promise<number>} A promise that resolves with a free port number.
 */
function findFreePort() {
    return new Promise((resolve, reject) => {
        const server = http.createServer();
        server.listen(0, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        server.on("error", reject);
    });
}

/**
 * Splits a string by spaces or commas into an array of trimmed, non-empty strings.
 * @param {string} value The string to split.
 * @returns {string[]} An array of strings.
 */
function splitArray(value) {
    if (!value) return [];
    return value.split(REG_SPLIT).map(item => item.trim()).filter(item => item !== '');
}


function getAppConfigFile(config) {
    let configfile = '# This file is generated by generate_config.js\n';
    let envfile = '# This file is generated by generate_config.js\n';


    Object.keys(config).forEach((key) => {
        let value = String(config[key] ?? ''); // Ensure value is a string

        // Add conditional '$' prefix for specific keys in `config` file (restored from old script)
        if (['api', 'cors', 'tmsurl', 'tms'].includes(key)) {
            configfile += `$`;
        }
        
        // Add quotes to values with spaces for the .env file
        let envValue = value.trim();
        if (envValue.includes(' ') && !envValue.startsWith("'")) {
            envValue = `'${envValue}'`;
        }

        configfile += `${key} : ${value.trim()}\n`;
        envfile += `${key}=${envValue}\n`;
    });

    return { configfile, envfile };

}