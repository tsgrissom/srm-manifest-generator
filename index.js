import fs from 'node:fs';

import chalk from 'chalk';
import YAML from 'yaml';

// TODO: Modularize this file

const getCountString = (count, singularNoun, pluralNoun = null) => {
    if (typeof(count) !== 'number') {
        console.error('Cannot pluralize count which is not a number');
        return 'ERROR';
    }

    pluralNoun = pluralNoun || `${singularNoun}s`; 

    const verbiage = (count === 0 || count > 1) ? pluralNoun : singularNoun;
    return `${count} ${verbiage}`;
};

const isDebugging = process.argv.includes('--debug'); // TODO: Replace with better CLI

async function readInputManifest(inputFile) {
    // TODO: Validate file is a yml
    try {
        const data = await fs.promises.readFile(inputFile, 'utf8');
        const json = YAML.parse(data);
        // TODO: Validate JSON data received from input manifest
        return json;
    } catch (err) {
        console.error(`Failed to read input manifest file at ${inputFile}`, err);
    }
}

async function writeOutputManifest(inputFile) {
    const inputJson = await readInputManifest(inputFile);
    const { directory, name } = inputJson;
    const outputPath = inputJson.output;
    
    if (!outputPath) {
        console.error('Output path not specified');
        return;
    }

    const inputEntries = inputJson.entries || [];
    const outputValues = inputEntries.map(entry => {
        const { title, target } = entry;
        // TODO: Lint the input object for valid path, exe, etc.
        return {
            title: title,
            target: `${directory}/${target}`
        };
    });

    const outputValuesCount = getCountString(outputValues.length, 'title');

    if (isDebugging) {
        console.log(chalk.yellow(`Transformed ${outputValuesCount} from ${name}`));
        console.log(outputValues);
    }

    const check = chalk.green.bold('\u2713 ');
    const inputName = `"${inputFile}"`;
    const outputName = `"${outputPath}`;

    console.log(check + 'Source ' + chalk.cyan(name) + ' looks valid');
    if (isDebugging) {
        console.log(`  - Input Manifest File: ${inputFile}`);
        console.log(`  - Output Manifest File: ${outputPath}`);
        console.log(`  - Source Name: ${name}`);
        console.log(`  - Base Directory: ${directory}`);
    }
    // console.log(check + `Titles from ${inputName} look valid. Writing to ${outputName}...`);
    
    const jsonStrOutput = JSON.stringify(outputValues, null, 2);
    fs.writeFile(outputPath, jsonStrOutput, (err) => {
        if (err) {
            console.error(chalk.red(`Error writing results to file: ${err}`));
        } else {
            console.log(check + 'Wrote ' + chalk.magenta(outputValuesCount) + ' for source ' + chalk.cyan(name));
            
            if (isDebugging) {
                console.log(`  - Input File: ${inputName}`);
                console.log(`  - Output File: ${outputName}`);
            }
        }
    });
}

// TODO: Check if config exists
fs.promises.readFile('./config.yml', 'utf8')
    .then(data => {
        const config = YAML.parse(data);
        // TODO: Validate config, lint manifest file paths, etc.
        const {manifests} = config;

        if (!Array.isArray(manifests)) {
            console.error('Expected key "manifests" to be an array of paths in config.yml');
            return;
        }

        if (isDebugging) {
            console.log(chalk.yellow('Loaded Manifests (per config.yml):'));
            console.log(manifests);
        }

        manifests.forEach(input => {
            console.log('writeOutputManifest triggered: ' + input);
            writeOutputManifest(input);
        });
    })
    .catch(err => {
        console.error('Failed to load config.yml', err);
    });