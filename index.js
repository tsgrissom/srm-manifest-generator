import chalk from 'chalk';
import fs from 'fs';
import YAML from 'yaml';

const isDebugging = process.argv.includes('--debug');

function makeOutputManifest(inputManifest) {
    const file = fs.readFileSync(inputManifest, 'utf8');
    const parsed = YAML.parse(file);

    // if (isDebugging) {
    //     console.log(chalk.yellow(`Parsed raw YAML manifest: ${inputManifest}`));
    //     console.log(parsed);
    // }

    const repackerName = parsed.name;
    const repackerDir = parsed.directory;
    const outputFile = parsed.output
    const rawTitles = parsed.titles;

    // if (isDebugging) {
    //     console.log(chalk.yellow(`Raw Titles from ${repackerName}`));
    //     console.log(rawTitles);
    // }

    const transformedTitles = [];

    rawTitles.forEach(rawTitle => {
        const title = rawTitle.title;
        const rawTarget = rawTitle.target;
        const newTarget = `${repackerDir}/${rawTarget}`;
        
        transformedTitles.push({
            title: title,
            target: newTarget
        });
    });

    if (isDebugging) {
        console.log(chalk.yellow(`Titles from ${repackerName}`));
        console.log(transformedTitles);
    }

    console.log(chalk.green(`Titles look valid, writing to ${outputFile}...`));
    const jsonString = JSON.stringify(transformedTitles, null, 2);
    fs.writeFile(outputFile, jsonString, (err) => {
        if (err) {
            console.error('Error writing results to file', err);
        } else {
            console.log(chalk.green(`Success! Titles from ${inputManifest} written to ${outputFile}`));
        }
    })
}

// TODO: Check if config exists
const configFile = fs.readFileSync('./config.yml', 'utf8');
const config = YAML.parse(configFile);
// TODO: Check if config is valid, lint manifest file paths, etc.
const manifests = config['manifest-files'];

if (isDebugging) {
    console.log(chalk.yellow('Manifests from config.yml:'));
    console.log(manifests);
}

manifests.forEach(inputManifest => {
    makeOutputManifest(inputManifest);
});