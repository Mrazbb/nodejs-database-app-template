// Import the dotenv package
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Resolve paths for configuration files
const config = path.resolve(__dirname, '../.env.main');
const sampleConfig = path.resolve(__dirname, '../.env.main.sample');

// Check if the main configuration file exists
if (!fs.existsSync(config)) {
    console.log('Config file not found');
}

// Parse the sample configuration file
let keys = Object.keys(dotenv.parse(fs.readFileSync(sampleConfig)));
let missingKeys = [];

// Identify missing keys
keys.forEach((key) => {
    if (!dotenv.parse(fs.readFileSync(config)).hasOwnProperty(key)) {
        missingKeys.push(key);
    }
});

// Display results in the terminal
if (missingKeys.length > 0) {
    for (let i = 0; i < missingKeys.length; i++) {
        console
    }
    console.log('\x1b[31mMissing keys:\x1b[0m', missingKeys); // Red text for missing keys
    process.exit(1);
    
} else {
    console.log('\x1b[32mAll keys are present.\x1b[0m'); // Green text for all keys present
    // close terminal
    process.exit();
}

