// logger.js

const util = require('util');

function formatObject(obj) {
    // util.inspect is more powerful than JSON.stringify for logging.
    // It handles circular refs, Functions, BigInts, etc.
    return util.inspect(obj, { depth: null, colors: true });
}

// 1. Centralized logging function to avoid duplication
function _log(level, ...args) {
    // 2. A slightly less fragile way to get caller info, but still not ideal.
    const stack = new Error().stack.split('\n');
    // Find the first line in the stack that is not this file.
    const callerLine = stack.find(line => line.includes('at ') && !line.includes(__filename));
    
    // A simplified way to get a clean path
    const location = callerLine ? callerLine.trim().split('(').pop().replace(')', '') : 'unknown';

    const timestamp = new Date().toISOString(); // Standard format is better
    const levelString = level.padEnd(5, ' '); // Padded for alignment
    
    let logMessage = `${levelString} ==== ${timestamp}  ---> ${location}\n`;

    for (const item of args) {
        if (typeof item === 'object' && item !== null) {
            // Use the robust formatter and indent the output
            logMessage += `\t${formatObject(item).replace(/\n/g, '\n\t')}\n`;
        } else {
            logMessage += `\t${item}\n`;
        }
    }
    
    // 3. Use console.error for errors, console.log for logs. This is standard practice.
    if (level === 'ERROR') {
        console.error(logMessage);
    } else {
        console.log(logMessage);
    }
}

// 4. Export functions instead of using globals
function printlog(...args) {
    _log('LOG', ...args);
}

function printerr(...args) {
    _log('ERROR', ...args);
}


global.printlog = printlog;
global.printerr = printerr;

