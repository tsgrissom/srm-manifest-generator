import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

import yaml from 'yaml';

export const URL_EXAMPLE_CONFIG  = 'https://raw.githubusercontent.com/tsgrissom/srm-manifest-generator/refs/heads/main/config/examples/example.config.yml',
             PATH_EXAMPLE_CONFIG = path.join('config', 'examples', 'example.config.yml'),
             //PATH_USER_CONFIG = PATH_EXAMPLE_CONFIG;
             PATH_USER_CONFIG    = path.join('config', 'config.yml');

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

export async function loadDataFromUserConfig() {
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