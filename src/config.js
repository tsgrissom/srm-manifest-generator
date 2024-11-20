import fs from 'node:fs';
import https from 'node:https';

import chalk from 'chalk';
import yaml from 'yaml';

const URL_EXAMPLE_CONFIG = 'https://raw.githubusercontent.com/tsgrissom/srm-manifest-generator/refs/heads/main/config/examples/example.config.yml';
const PATH_EXAMPLE_CONFIG = './config/examples/example.config.yml';
const PATH_USER_CONFIG = './config/config.yml';
// const PATH_USER_CONFIG = './config/examples/example.config.yml';

async function downloadExampleConfig() {
    return new Promise((resolve, reject) => {
        https.get(URL_EXAMPLE_CONFIG, response => {
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to get file. Status code: ${response.statusCode}`));
            }

            const fileStreamExample = fs.createWriteStream(PATH_EXAMPLE_CONFIG);
            const fileStreamUser = fs.createWriteStream(PATH_USER_CONFIG);
            response.pipe(fileStreamExample);
            response.pipe(fileStreamUser);

            let finishedStreams = 0;

            const onStreamFinish = () => {
                finishedStreams += 1;
                if (finishedStreams === 2) {
                    resolve();
                }
            };

            fileStreamExample.on('finish', () => {
                console.log(`Finished restoring ${PATH_EXAMPLE_CONFIG} via GitHub download`);
                onStreamFinish();
            });
            fileStreamUser.on('finish', () => {
                console.log(`Finished copying latest version of example.config.yml to ${PATH_USER_CONFIG}`);
                onStreamFinish();
            });

            const onError = (err) => {
                fileStreamExample.close(() => fs.unlink(PATH_EXAMPLE_CONFIG, () => {}));
                fileStreamUser.close(() => fs.unlink(PATH_USER_CONFIG, () => {}));
                reject(err);
            };

            fileStreamExample.on('error', onError);
            fileStreamUser.on('error', onError);
        }).on('error', reject);
    });
}

async function copyExampleConfigToUserConfigPath() {
    try {
        const exampleConfigFile = await fs.promises.readFile(PATH_EXAMPLE_CONFIG, 'utf8');
        await fs.promises.writeFile(PATH_USER_CONFIG, exampleConfigFile, 'utf8');
        console.log(`Default config copied to ${PATH_USER_CONFIG}`);
    } catch (err) {
        console.error(`Failed to copy example config to ${PATH_USER_CONFIG}:`, err);
    }
}

async function loadUserConfigData() {
    let userConfigHandle;
    let exampleConfigHandle;

    try {
        // Check that user config.yml exists
        userConfigHandle = await fs.promises.open(PATH_USER_CONFIG, 'r');
    } catch {
        // If user config missing, check for example.config.yml
        try {
            exampleConfigHandle = await fs.promises.open(PATH_EXAMPLE_CONFIG, 'r');
            console.log(`SRM Manifest Generator is missing a ${PATH_USER_CONFIG}. Creating new default config based on example.config.yml...`);
            await copyExampleConfigToUserConfigPath();
        } catch {
            // If both missing
            console.log(`SRM Manifest Generator is missing a ${PATH_USER_CONFIG}, but the example.config.yml has been deleted.`);
            console.log(`Restoring ${PATH_EXAMPLE_CONFIG} with latest version from GitHub (URL below), then creating a new default config.yml based on example.config.yml...`);
            await downloadExampleConfig();
        }
    } finally {
        if (userConfigHandle) {
            await userConfigHandle.close();
        }
        if (exampleConfigHandle) {
            await exampleConfigHandle.close();
        }
    }

    const configFile = await fs.promises.readFile(PATH_USER_CONFIG, 'utf8');
    const configData = yaml.parse(configFile);

    return configData;
}

function printInvalidConfigReasonAndExit(message, displayReadme = true) {
    console.error(chalk.red(`Invalid User Config: ${message}`));
    if (displayReadme) {
        console.log(chalk.red('See the project README: ') + chalk.red.underline('https://github.com/tsgrissom/srm-manifest-generator'));
    }
    process.exit();
}

function printConfigStatus(message) {
    console.log(`User Config: ${message}`);
}

// LOAD, PARSE, AND EXPORT USER CONFIG

let userConfigData;
const userConfig = {
    search: {},
    output: {},
    validation: {},
    logging: {}
};

try {
    userConfigData = await loadUserConfigData();
} catch (error) {
    console.error(chalk.red('An error occurred while loading the user config data:', error));
}

if (!userConfigData) {
    if (!fs.existsSync(PATH_USER_CONFIG)) {
        printInvalidConfigReasonAndExit('You must create a config.yml to use SRM Manifest Generator');
    } else {
        printInvalidConfigReasonAndExit('Your config.yml cannot be empty. Visit the link below to view required configuration options.');
    }
}

// Process section: "search"
{
    const section = userConfigData.search;

    if (section === null) {
        printInvalidConfigReasonAndExit('Your config.yml "search" section cannot be empty');
    }
    if (!section) {
        printInvalidConfigReasonAndExit('Your config.yml is missing the required section "search"');
    }

    const { manifests } = section;

    if (!manifests) {
        printInvalidConfigReasonAndExit('Your config.yml is missing the required list of paths "manifests" within the section "search"');
    }
    
    const scanDirectories = section['scan-directories'] ?? true;
    const recursive = section.recursive || false;
    // TODO: Implement options
    const processedManifests = manifests;
    // TODO: Process manifest paths

    userConfig.search.scanDirectories = scanDirectories;
    userConfig.search.recursive = recursive;
    userConfig.search.manifests = processedManifests;

    printConfigStatus(`Loaded ${processedManifests.length}/${manifests.length} manifest paths`);
}

// Process section: "output"

// Process section: "validation"

// Process section: "logging"

export default userConfig;