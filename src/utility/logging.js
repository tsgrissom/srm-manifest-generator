import chalk from 'chalk';

// TODO jsdoc

/**
 * 
 * @returns {boolean}
 */
const isDebugging = () => process.env.DEBUG === 'true' || process.argv.includes('--debug') || process.argv.includes('-D');

export function logDebugPlain(message) {
    if (isDebugging()) {
        console.log(message);
    }
}

export function logDebugHeader(header) {
    if (isDebugging()) {
        console.log('');
        console.log(chalk.magenta('DEBUG: ') + header);
    }
}

export function logDebug(message, withPrefix = true, withColor = true) { // TODO Do I even need withColor here?
    if (isDebugging()) {
        const prefix = 'DEBUG: ';
        let builder = withPrefix ? (withColor ? chalk.magentaBright(prefix) : prefix) : '';
        builder += message;

        console.log(builder);
    }
}

export function logDebugLines(...message) {
    if (isDebugging()) {
        for (const line of message) {
            console.log(line);
        }
    }
}

export function logDebugSectionWithData(header, ...data) {
    if (isDebugging()) {
        console.log(chalk.magenta('DEBUG: ') + header);
        for (const line of data) {
            console.log(` > ${line}`);
        }
    }
}