import chalk from 'chalk';
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

import yaml from 'yaml';

import { UserConfigData } from './UserConfig.js';

const EXAMPLE_CONFIG_FILENAME = 'example.config.yml';
const EXAMPLE_CONFIG_PATH = path.join('config', 'example', EXAMPLE_CONFIG_FILENAME);
const EXAMPLE_CONFIG_URL = `https://raw.githubusercontent.com/tsgrissom/srm-manifest-generator/refs/heads/main${EXAMPLE_CONFIG_PATH}`;

// console.log(chalk.bgMagenta(EXAMPLE_CONFIG_URL));

const USER_CONFIG_FILENAME = 'config.yml';
const USER_CONFIG_PATH = path.join('config', USER_CONFIG_FILENAME) // PATH_EXAMPLE_CONFIG;

/**
 * Attempts to download the example.config.yml from the project repository,
 * writing its contents into the local `./config/example` folder.
 * @returns A `Promise` that resolves to a `boolean` or rejects if
 *   unhandled errors occur.
 */
async function downloadExampleConfig() : Promise<boolean> {
    return new Promise((resolve, reject) => {
        https.get(EXAMPLE_CONFIG_URL, response => {
            if (response.statusCode !== 200)
                return reject(new Error(`Failed to get . Status code: ${response.statusCode}`));

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
                console.log(`Finished copying latest version of ${EXAMPLE_CONFIG_FILENAME} to ${USER_CONFIG_PATH}`);
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

/**
 * Attempts to copy the file at {@link EXAMPLE_CONFIG_PATH} to the
 * {@link USER_CONFIG_PATH}.
 * 
 * @returns A Promise which resolves to undefined if resolved, or otherwise
 *   rejects when an unhandled error occurs.
 */
async function copyExampleConfigToUserConfigPath() : Promise<void> {
    try {
        const exampleConfigFile = await fs.promises.readFile(EXAMPLE_CONFIG_PATH, 'utf8');
        await fs.promises.writeFile(USER_CONFIG_PATH, exampleConfigFile, 'utf8');
        console.log(`Default config copied to ${USER_CONFIG_PATH}`);
    } catch (err) {
        console.error(`Failed to copy example config to ${USER_CONFIG_PATH}:`, err);
    }
}

/**
 * Attempts to load the user's config file from {@link USER_CONFIG_PATH},
 * returning a `Promise` which resolves to a {@link UserConfigData}
 * representation of the file. If there is no user config at the
 * expected location, the function falls back to the following:
 * 
 * 1. Check that the user config file exists. If it exists, the
 *    function proceeds to load the user config data.
 * 2. If it does not exist, check if the example config is in its
 *    place ({@link EXAMPLE_CONFIG_PATH}.)
 * 3. If the example config is found on the filesystem, it is
 *    copied to the user config path, after which the function
 *    proceeds to loading: {@link copyExampleConfigToUserConfigPath}.
 * 4. If the example config is not found, the function attempts
 *    to restore the example config path by downloading the latest
 *    version of the file from GitHub: {@link downloadExampleConfig}.
 * 5. While restoring the file from the web, the function also
 *    copies the new file to the user config path. After this,
 *    the function attempts to load the user config data.
 * 
 * @returns A Promise which resolves to a {@link UserConfigData} if
 *   resolved, or otherwise rejects when all fallback methods are
 *   exhausted or unhandled errors occur.
 */
async function loadUserConfigData() : Promise<UserConfigData> {
    let userConfigHandle;
    let exampleConfigHandle;

    try { // Check that user config file exists
        userConfigHandle = await fs.promises.open(USER_CONFIG_PATH, 'r');
    } catch { // User config is missing
        try { // Check if example config is in place, copy it to the user's config path if present
            exampleConfigHandle = await fs.promises.open(EXAMPLE_CONFIG_PATH, 'r');
            console.log(`SRM Manifest Generator is missing a ${USER_CONFIG_PATH}. Creating new default config based on ${EXAMPLE_CONFIG_FILENAME}...`);
            await copyExampleConfigToUserConfigPath();
        } catch { // If both are missing, try to fetch the latest copy of the example config from repo
            console.log(`SRM Manifest Generator is missing a ${USER_CONFIG_PATH}, but the ${EXAMPLE_CONFIG_FILENAME} has been deleted.`);
            console.log(`Restoring ${EXAMPLE_CONFIG_PATH} with latest version from GitHub (URL below), then creating a new default ${USER_CONFIG_FILENAME} based on ${EXAMPLE_CONFIG_FILENAME}...`);
            await downloadExampleConfig();
        }
    } finally {
        if (userConfigHandle)
            await userConfigHandle.close();
        if (exampleConfigHandle)
            await exampleConfigHandle.close();
    }

    const fileContents = await fs.promises.readFile(USER_CONFIG_PATH, 'utf8');
    const configData = yaml.parse(fileContents);

    if (typeof configData !== 'object' || Array.isArray(configData)) {
        console.error(chalk.red(`
            User Config is malformed: Expected parsed data to be of type object, but was actually an array or other non-object.
            For an example config, please see: ${EXAMPLE_CONFIG_URL}
        `));
        throw new Error(`User ${USER_CONFIG_FILENAME} is invalid`);
    }  

    return configData;
}

export {
    EXAMPLE_CONFIG_FILENAME, EXAMPLE_CONFIG_PATH, EXAMPLE_CONFIG_URL,
    USER_CONFIG_FILENAME, USER_CONFIG_PATH,
    loadUserConfigData
};