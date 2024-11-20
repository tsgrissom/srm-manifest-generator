import fs from 'node:fs';

import chalk from 'chalk';
import yaml from 'yaml';

import { getCountString } from './utilities.js';
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
    const outputValues = inputEntries.map(entry => {
        const { title, target } = entry;
        // TODO: Lint the input object for valid path, exe, etc.
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

    const debug = `DEBUG:\nscanDirectories: ${scanDirectories}\nrecursive: ${recursive}\nmanifests: ${manifests}`;
    console.log(chalk.blue(debug));

    manifests.forEach(input => {
        if (isDebugging) {
            console.log(`  - "${input}"`);
        }

        writeOutputManifest(input);
    });
}

export default startApp;