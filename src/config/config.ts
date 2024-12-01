import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';

import { UserConfig } from './UserConfig.js';
import { loadUserConfigData } from './load-config.js';
import { dlog, isDebugging } from '../utility/logging.js';
import { delimitedList } from '../utility/string.js';
import { boolFmt } from '../utility/boolean.js';

const EXAMPLE_CONFIG_FILENAME = 'example.config.yml';
const EXAMPLE_CONFIG_PATH = path.join('config', 'example', EXAMPLE_CONFIG_FILENAME);
const EXAMPLE_CONFIG_URL = `https://raw.githubusercontent.com/tsgrissom/srm-manifest-generator/refs/heads/main${EXAMPLE_CONFIG_PATH}`;

const USER_CONFIG_FILENAME = 'config.yml';
const USER_CONFIG_PATH = path.join('config', USER_CONFIG_FILENAME) // PATH_EXAMPLE_CONFIG;

const logConfigStatus = (message: string) => console.log(`User Config: ${message}`);
const dlogConfigStatus = (message: string) => { if (isDebugging()) logConfigStatus(message) }

const logConfigInvalid = (message: string, withReadme: boolean = true) => {
    console.error(chalk.red(`INVALID User Config: ${message}`));
    if (withReadme)
        console.error(chalk.redBright(`See the project README: `) + chalk.redBright.underline('https://github.com/tsgrissom/srm-manifest-generator'))
}

async function loadData() : Promise<object> {
    let userConfigData;
    try {
        userConfigData = await loadUserConfigData();
        return userConfigData;
    } catch (err) {
        throw new Error(`Error loading user config data: ${err}`);
    }
}

function parseSearchSection(data: object, userConfig: UserConfig) : UserConfig {
    if (!Object.keys(data).includes('search'))
        throw new Error(chalk.red('User Config is missing required section "search"'));

    const section = (data as Record<string, unknown>)['search'];
    
    if (typeof section !== 'object' || section === null)
        throw new Error(chalk.red('User Config "search" section is not a valid object'));
    if (Array.isArray(section))
        throw new Error(chalk.red('User Config "search" section must be a mapping, not a list (Expected object, Found array)'));

    for (const key of Object.keys(section)) {
        console.log(`Key in search section: ${key}`);
    }

    const keyAliases: Record<string, string> = {
        scanDirectories: 'directories',
        scanRecursively: 'recursively',
        manifests: 'sources'
    }
    const resolveAlias = (key: string): string => {
        return keyAliases[key] || key;
    }

    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveAlias(key);

        switch (resolved) {
            case 'scanDirectories': {
                if (typeof value === 'boolean') {
                    userConfig.search.scanDirectories = value;
                    dlogConfigStatus(`search.scanDirectories set=${boolFmt(value)}`);
                } else {
                    logConfigInvalid(`Value of search.scanDirectories must be a boolean but was not: ${value}`);
                }
                break;
            }
            case 'scanRecursively': {
                if (typeof value === 'boolean') {
                    userConfig.search.scanRecursively = value;
                    dlogConfigStatus(`search.scanRecursively set=${boolFmt(value)}`);
                } else {
                    logConfigInvalid(`Value of search.scanRecursively must be a boolean but was not: ${value}`);
                }
                break;
            }
            case `manifests`:
                if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
                    userConfig.search.manifests = value;
                    dlogConfigStatus(`search.manifests set=${delimitedList(value)}`)
                } else {
                    if (!Array.isArray(value)) {
                        logConfigInvalid('Value of search.manifests must be array of strings but was not an array');
                    } else {
                        logConfigInvalid('All entries of search.manifests must be a string but at least one was not');
                    }
                }
                break;
        }
    }

    return userConfig;
}

export async function parseUserConfigData() : Promise<UserConfig> {
    const userConfigData = await loadData();

    if (!userConfigData) {
        try {
            await fs.promises.access(USER_CONFIG_PATH);
            throw new Error(`Your ${USER_CONFIG_FILENAME} cannot be empty.`);
        } catch {
            throw new Error(`You must create a ${USER_CONFIG_FILENAME} to use SRM Manifest Generator`)
        }
    }

    if (typeof userConfigData !== 'object' || Array.isArray(userConfigData)) {
        console.error(chalk.red(`
            User Config is malformed: Expected parsed data to be of type object, but was actually an array or other non-object.
            For an example config, please see: ${EXAMPLE_CONFIG_URL}
        `));
        throw new Error(`User ${USER_CONFIG_FILENAME} is invalid`);
    }  

    let userConfig: UserConfig = {
        search: {
            scanDirectories: false,
            scanRecursively: false,
            manifests: []
        },
        output: {
            minify: false,
            indentationSpaces: 0,
            spreadMode: 'file'
        },
        validation: {
            validateFilePaths: false,
            validateExecutables: false,
            acceptedExecutables: []
        },
        logging: {
            enabled: false,
            outputFile: ''
        }
    };

    // TODO Sift through and load data

    userConfig = parseSearchSection(userConfigData, userConfig);

    return userConfig;
}

(async () => {
    console.log(EXAMPLE_CONFIG_PATH);
    await parseUserConfigData();
})();

export {
    EXAMPLE_CONFIG_FILENAME,
    EXAMPLE_CONFIG_PATH,
    EXAMPLE_CONFIG_URL,
    USER_CONFIG_FILENAME,
    USER_CONFIG_PATH
}