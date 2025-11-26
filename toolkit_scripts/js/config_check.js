const fs = require('fs');
const path = require('path');

// --- Configuration ---


// Define ANSI color codes for terminal output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

const projectRoot = process.cwd();
const mainConfigPath = path.resolve(projectRoot, '.env.main');
const sampleConfigPath = path.resolve(projectRoot, '.env.main.sample');




// Check if files exist
if (!fs.existsSync(mainConfigPath)) {
    console.error('.env.main file does not exist');
    process.exit(1);
}

if (!fs.existsSync(sampleConfigPath)) {
    console.error('.env.main.sample file does not exist');
    process.exit(1);
}

// Read the files
const envContent = fs.readFileSync(mainConfigPath, 'utf8');
const envSampleContent = fs.readFileSync(sampleConfigPath, 'utf8');

// Parse files manually to preserve comments and formatting
function parseEnvFile(content) {
    const lines = content.split('\n');
    const variables = {};
    const format = [];
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine.startsWith('#')) {
            // This is a comment or empty line
            format.push({ type: 'comment', content: line });
        } else {
            // This is a variable
            const match = line.match(/^([^=]+)=(.*)/);
            if (match) {
                const key = match[1].trim();
                const value = match[2];
                variables[key] = value;
                format.push({ type: 'variable', key, line, value });
            } else {
                // Treat as comment if not valid key=value
                format.push({ type: 'comment', content: line });
            }
        }
    });
    
    return { variables, format };
}

const envData = parseEnvFile(envContent);
const envSampleData = parseEnvFile(envSampleContent);

// Find missing variables in env.main
const missingInMain = Object.keys(envSampleData.variables).filter(key => 
    !envData.variables.hasOwnProperty(key)
);

// Find missing variables in env.main.sample
const missingInSample = Object.keys(envData.variables).filter(key => 
    !envSampleData.variables.hasOwnProperty(key)
);



// Create a new file that copies format from .env.main.sample but uses values from .env.main
let newContent = '';

for (const item of envSampleData.format) {
    if (item.type === 'comment') {
        // Copy comments exactly
        newContent += item.content + '\n';
    } else if (item.type === 'variable') {
        // For variables, use value from .env.main if it exists, otherwise keep sample value
        const key = item.key;
        if (envData.variables.hasOwnProperty(key)) {
            // Use value from .env.main
            newContent += `${key}=${envData.variables[key]}\n`;
        } else {
            // Keep original value from sample
            newContent += `${key}=changethis\n`;
        }
    }
}

// Log the results
if (missingInMain.length > 0) {
    console.log(`${colors.yellow}Variables missing in .env.main that exist in .env.main.sample:${colors.reset}`);
    console.log(missingInMain);

    // Print the new content
    console.log(`\n${colors.green}--- New content based on .env.main.sample with values from .env.main ---${colors.reset}`);
    console.log(newContent);
} else {
    console.log(`${colors.green}All variables are present in .env.main from .env.main.sample.${colors.reset}`);
}

if (missingInSample.length > 0) {
    console.log(`\n${colors.yellow} Variables in .env.main that are missing in .env.main.sample:${colors.reset}`);
    console.log(missingInSample);
} else {
    console.log(`${colors.green}All variables are present in .env.main.sample from .env.main.${colors.reset}`);
}

console.log(`\n${colors.green}-- End of config check --${colors.reset}`);
