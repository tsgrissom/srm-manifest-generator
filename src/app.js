import fs from 'node:fs';

import chalk from 'chalk';
import yaml from 'yaml';

import { getCountString, getFormattedBoolean, logDebug } from './utilities.js';
import userConfig from './config.js';

const isDebugging = process.argv.includes('--debug'); // TODO: Replace with better CLI

async function readInputManifest(inputFile) {
    // TODO: Validate file is a yml
    try {
        const data = await fs.promises.readFile(inputFile, 'utf8');
        const json = yaml.parse(data);
        // TODO: Validate JSON data received from input manifest
        return json;
    } catch (err) {
        console.error(`Failed to read input manifest file at ${inputFile}`, err);
    }
}

async function writeOutputManifest(inputPath) {
    const inputJson = await readInputManifest(inputPath);
    const { directory, name } = inputJson;
    const outputPath = inputJson.output;
    
    if (!outputPath) {
        console.error(`Output path not specified for source manifest file: ${inputPath}`);
        return;
    }

    const check = chalk.green.bold('\u2713 ');
    const inputName = `"${inputPath}"`;
    const outputName = `"${outputPath}"`;

    const inputEntries = inputJson.entries || [];
    const outputValues = inputEntries
    .filter(shortcut => {
        const {enabled} = shortcut;
        const isEnabled = enabled || enabled === undefined;
        return isEnabled; // TODO Check for anticipated behavior
    })
    .map(shortcut => {
        const {title, target} = shortcut;
        // TODO Lint input object for valid path, executable, etc.
        return {
            title: title,
            target: `${directory}/${target}`
        };
    });

    const strCount = getCountString(outputValues.length, 'title');
    const strHeader = `Transformed ${strCount} from source "${name}"`;

    if (isDebugging) {
        console.log(chalk.yellow(strHeader));
        console.log(`  - Input Manifest File: ${inputPath}`);
        console.log(`  - Output Manifest File: ${outputPath}`);
        console.log(`  - Source Name: ${name}`);
        console.log(`  - Base Directory: ${directory}`);
    } else {
        console.log(strHeader);
    }
    
    const jsonString = JSON.stringify(outputValues, null, 2);
    fs.writeFile(outputPath, jsonString, (err) => {
        if (err) {
            console.error(chalk.red(`Error writing results to file: "${outputPath}"`));
            console.error(chalk.red(err));
        } else {
            console.log(check + 'Wrote ' + chalk.magenta(strCount) + ' for source ' + chalk.cyan(name));
            
            if (isDebugging) {
                console.log(`  - Input File: ${inputName}`);
                console.log(`  - Output File: ${outputName}`);
            }
        }
    });
}

function startApp() {
    const { manifests, scanDirectories, recursive } = userConfig.search;

    logDebug('User Config');
    logDebug(` - Should Scan Directories: ${getFormattedBoolean(scanDirectories)}`, false);
    logDebug(` - Should Scan Recursively: ${getFormattedBoolean(recursive)}`, false);
    logDebug(` - Manifests: ${manifests}`, false);

    manifests.forEach(input => {
        if (isDebugging) {
            console.log(`  - "${input}"`);
        }

        writeOutputManifest(input);
    });
}

export default startApp;