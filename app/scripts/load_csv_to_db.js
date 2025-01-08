require('total5');
let env = require('dotenv').config({ path: '../.env' }).parsed;

const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

require('querybuilderpg').init('', "postgresql://" + env['postgres'], 10, ERROR('PostgreSQL'));

const tables = [
    'public.tbl_config',
    'localization.tbl_domain',
    'localization.tbl_lang_country'
];

function sanitizeRecord(record) {
    const sanitized = {};
    for (let key in record) {
        // Convert empty strings to null
        if (record[key] === '') {
            sanitized[ key ] = '';
        } else {
            sanitized[key] = record[key];
        }
    }
    return sanitized;
}

async function processCSVFile(filePath, tableName) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv({ separator: ';' }))
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    console.log(`Processing ${results.length} records for ${tableName}`);
                    
                    // Clear existing data
                    for (let i = 0; i < results.length; i++) {
                        let record = sanitizeRecord(results[i]);
                        let prev = await DATA.find(tableName).where('id', record.id).first().promise();
                        console.log('prev', prev);
                        if (prev) {
                            console.log('update', record);
                            await DATA.update(tableName, record).where('id', record.id).promise();
                        } else {
                            console.log('insert', record);
                            await DATA.insert(tableName, record).promise();
                        }
                    }

                    console.log(`Successfully imported data for ${tableName}`);
                    resolve();
                } catch (err) {
                    console.error(`Error importing data for ${tableName}:`, err);
                    reject(err);
                }
            })
            .on('error', (err) => {
                console.error(`Error reading CSV file for ${tableName}:`, err);
                reject(err);
            });
    });
}

async function migrate() {
    try {
        console.log('Starting database import from CSV files');
        
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            const csvFileName = `${String(i).padStart(2, '0')}_${table}.csv`;
            const csvPath = path.join(__dirname, '..', 'private', 'sql', '07_csv', csvFileName);
            
            if (!fs.existsSync(csvPath)) {
                console.error(`CSV file not found: ${csvPath}`);
                continue;
            }
            
            console.log(`Processing file: ${csvFileName}`);
            await processCSVFile(csvPath, table);
        }
        
        console.log('Database import completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

// Run migration
migrate().then(() => {
    console.log('Migration process finished');
    process.exit(0);
}).catch(err => {
    console.error('Migration process failed:', err);
    process.exit(1);
});
