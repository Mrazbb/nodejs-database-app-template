
function printerr(...error) {
    try {
        // Intentionally throw an error to capture the stack trace
        throw new Error();
    } catch (e) {

        // Extract the relevant line from the stack trace
        const stack = e.stack.split('\n')[2].trim().replace('at Object.action (/opt/app/', '').replace('at Object.callback (/opt/app/', '');
        let log = `ERROR ${NOW.format('yyyy-MM-dd HH:mm:ss')}  ${stack}\n`;
        for (let m of error) {
            if (typeof m === 'object') {
                log += `\t${JSON.stringify(m, null, 2).replace(/\n/g, '\n\t')}\n`;
            } else {
                log += `\t${m}\n`;
            }
        }
        console.log(log);
    }
}

function printlog(...error) {

    try {
        // Intentionally throw an error to capture the stack trace
        throw new Error();
    } catch (e) {

        // Extract the relevant line from the stack trace
        const stack = e.stack.split('\n')[2].trim().replace('at Object.action (/opt/app/', '').replace('at Object.callback (/opt/app/', '');
        let log = `LOG ${NOW.format('yyyy-MM-dd HH:mm:ss')}  ${stack}\n`;
        for (let m of error) {
            if (typeof m === 'object') {
                log += `\t${JSON.stringify(m, null, 2).replace(/\n/g, '\n\t')}\n`;
            } else {
                log += `\t${m}\n`;
            }
        }
        console.log(log);
    }
}

function stringify(obj, spaces) {
    let cache = [];
    let replacer = function (key, value) {
        if (typeof value === "object" && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    };
    let str = JSON.stringify(obj, replacer, spaces);
    cache = null; // reset the cache
    return str;
}

global.printlog = printlog;
global.printerr = printerr;
