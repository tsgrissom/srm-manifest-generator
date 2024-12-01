import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

import yaml from 'yaml';

const EXAMPLE_CONFIG_FILENAME = 'example.config.yml';
const EXAMPLE_CONFIG_URL = 'https://raw.githubusercontent.com/tsgrissom/srm-manifest-generator/refs/heads/main/config/example/example.config.yml';
const EXAMPLE_CONFIG_PATH = path.join('config', 'example', EXAMPLE_CONFIG_FILENAME);

const USER_CONFIG_FILENAME = 'config.yml';
const USER_CONFIG_PATH = path.join('config', USER_CONFIG_FILENAME) // PATH_EXAMPLE_CONFIG;

/**
 * 
 * @returns 
 */
async function downloadExampleConfig() {
    return new Promise((resolve, reject) => {
        https.get(EXAMPLE_CONFIG_URL, response => {
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to get . Status code: ${response.statusCode}`));
            }

            const fileStreamExample = fs.createWriteStream(EXAMPLE_CONFIG_PATH),
                  fileStreamUser    = fs.createWriteStream(USER_CONFIG_PATH);

            response.pipe(fileStreamExample);
            response.pipe(fileStreamUser);

            let finishedStreams = 0;

            const onStreamFinish = () => {
                finishedStreams += 1;
                if (finishedStreams === 2) {
                    resolve(true);
                }
            };

            fileStreamExample.on('finish', () => {
                console.log(`Finished restoring ${EXAMPLE_CONFIG_PATH} via GitHub download`);
                onStreamFinish();
            });
            fileStreamUser.on('finish', () => {
                console.log(`Finished copying latest version of example.config.yml to ${USER_CONFIG_PATH}`);
                onStreamFinish();
            });

            const onError = (err: Error) => {
                fileStreamExample.close(() => fs.unlink(EXAMPLE_CONFIG_PATH, () => {}));
                fileStreamUser.close(() => fs.unlink(USER_CONFIG_PATH, () => {}));
                reject(err);
            };

            fileStreamExample.on('error', onError);
            fileStreamUser.on('error', onError);
        }).on('error', reject);
    });
}

async function copyExampleConfigToUserConfigPath() {
    try {
        const exampleConfigFile = await fs.promises.readFile(EXAMPLE_CONFIG_PATH, 'utf8');
        await fs.promises.writeFile(USER_CONFIG_PATH, exampleConfigFile, 'utf8');
        console.log(`Default config copied to ${USER_CONFIG_PATH}`);
    } catch (err) {
        console.error(`Failed to copy example config to ${USER_CONFIG_PATH}:`, err);
    }
}

async function loadDataFromUserConfig() {
    let userConfigHandle;
    let exampleConfigHandle;

    try {
        // Check that user config.yml exists
        userConfigHandle = await fs.promises.open(USER_CONFIG_PATH, 'r');
    } catch {
        // If user config missing, check for example.config.yml
        try {
            exampleConfigHandle = await fs.promises.open(EXAMPLE_CONFIG_PATH, 'r');
            console.log(`SRM Manifest Generator is missing a ${USER_CONFIG_PATH}. Creating new default config based on example.config.yml...`);
            await copyExampleConfigToUserConfigPath();
        } catch {
            // If both missing
            console.log(`SRM Manifest Generator is missing a ${USER_CONFIG_PATH}, but the example.config.yml has been deleted.`);
            console.log(`Restoring ${EXAMPLE_CONFIG_PATH} with latest version from GitHub (URL below), then creating a new default config.yml based on example.config.yml...`);
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

    const configFile = await fs.promises.readFile(USER_CONFIG_PATH, 'utf8');
    const configData = yaml.parse(configFile);

    return configData;
}

export {
    EXAMPLE_CONFIG_FILENAME, EXAMPLE_CONFIG_PATH, EXAMPLE_CONFIG_URL,
    USER_CONFIG_FILENAME, USER_CONFIG_PATH,
    loadDataFromUserConfig
};