/* eslint-disable @typescript-eslint/no-explicit-any */
// Disabled for special config clog and dlog functions

import fs from 'node:fs';
import path from 'node:path';

import clr from 'chalk';

import { clog } from '../utility/console.js';
import { isDebugActive } from '../utility/debug.js';
import { delimitedList } from '../utility/string.js';
import { boolFmt } from '../utility/boolean.js';

import { UserConfig } from '../type/config/UserConfig.js';

import { loadUserConfigData } from './load.js';
import { makeManifestsArray } from './parse.js';
import ConfigData from '../type/config/ConfigData.js';

export const EXAMPLE_CONFIG_FILENAME = 'example.config.yml';
export const EXAMPLE_CONFIG_PATH = path.join('config', 'example', EXAMPLE_CONFIG_FILENAME);
export const EXAMPLE_CONFIG_URL = `https://raw.githubusercontent.com/tsgrissom/srm-manifest-generator/refs/heads/main${EXAMPLE_CONFIG_PATH}`;

export const README_URL = 'https://github.com/tsgrissom/srm-manifest-generator'; // TODO Get from package.json

export const USER_CONFIG_FILENAME = 'config.yml';
export const USER_CONFIG_PATH = path.join('config', USER_CONFIG_FILENAME) // PATH_EXAMPLE_CONFIG;
export const USER_CONFIG_PFX = 'User Config';

export const clogConfInfo = (msg?: any) => clog(USER_CONFIG_PFX + `: ${msg}`);
export const clogConfOk   = (msg?: any) => clog(clr.green(USER_CONFIG_PFX) + `: ${msg}`);
export const clogConfSucc = (msg?: any) => clog(clr.green(USER_CONFIG_PFX) + `: ${msg}`);
export const clogConfWarn = (msg?: any) => console.warn(clr.yellow(USER_CONFIG_PFX) + `: ${msg}`);
export const clogConfErr  = (msg?: any) => console.error(clr.red(USER_CONFIG_PFX) + `: ${msg}`);

export const clogConfBad = (msg: string) => {
    console.error(clr.red(USER_CONFIG_PFX) + clr.redBright(`: User ${USER_CONFIG_FILENAME} is invalid - ${msg}`));
    console.error(clr.red('See the README: ') + clr.redBright.underline(README_URL));
}

export const dlogConfInfo = (msg?: any) => { if (isDebugActive()) clogConfInfo(msg) }
export const dlogConfValueLoaded = (key: string, value?: any) => {
    if (!isDebugActive()) return;
    if (value === undefined) value = '';

    // TODO Move code to string util quote
    let fmtValue: string = value;
    if (typeof value === 'string')
        fmtValue = value !== '' ? `"${value}"` : '';
    else if (typeof value === 'boolean')
        fmtValue = boolFmt(value);

    clogConfSucc(`Value of "${key}" set=${fmtValue}`);
}

// TODO Put this back where it belongs
//     const nOk = okManifests.length,
//           nAllPaths = allManifests.length;
    
//     let ctOk = `${nOk}/${nAllPaths}`;

//     if (nOk === nAllPaths) {
//         ctOk = chalk.green(ctOk);
//     } else if (nOk < nAllPaths) {
//         ctOk = chalk.red(ctOk);
//     }

//     logConfigStatus(`Loaded ${ctOk} configured manifest paths`);

//     dlogSectionWithData(
//         'User Config: Search section finished loading',
//         `Scan Directories? ${enabledDisabled(scanDirectories)}`,
//         `Scan Recursively? ${enabledDisabled(scanRecursively)}`,
//         chalk.blueBright('Manifest Paths')
//     );

// MARK: LOAD + PARSE

async function loadData() : Promise<object> {
    try {
        const data = await loadUserConfigData();
        return data;
    } catch (err) {
        throw new Error(`Error loading user config data: ${err}`);
    }
}

export async function parseUserConfigData() : Promise<ConfigData> {
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
        console.error(clr.red(`
            User Config is malformed: Expected parsed data to be of type object, but was actually an array or other non-object.
            For an example config, please see: ${EXAMPLE_CONFIG_URL}
        `));
        throw new Error(`User ${USER_CONFIG_FILENAME} is invalid`);
    }  

    let userConfig = new UserConfig();

    userConfig = await parseSearchSection(userConfigData, userConfig);
    userConfig = await parseOutputSection(userConfigData, userConfig);
    userConfig = await parseValidateSection(userConfigData, userConfig);
    userConfig = await parseOtherSection(userConfigData, userConfig);
    userConfig = await parseLogsSection(userConfigData, userConfig);

    return userConfig;
}

// MARK: LOAD SECTIONS

// -------------------

// MARK: Search

async function parseSearchSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('search'))
        throw new Error(clr.red('User Config is missing required section "search"'));

    const section = (data as Record<string, unknown>)['search'];
    
    if (typeof section !== 'object' || section === null)
        throw new Error(clr.red('User Config "search" section is not a valid object'));
    if (Array.isArray(section))
        throw new Error(clr.red('User Config "search" section must be a mapping, not a list (Expected object, Found array)'));

    const keyAliases: Record<string, string> = {
        directories: 'scanDirectories',
        recursively: 'scanRecursively',
        sources: 'manifests'
    }

    const resolveAlias = (key: string): string => {
        return keyAliases[key] || key;
    }

    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveAlias(key);

        switch (resolved) {
            case 'scanDirectories': {
                if (typeof value === 'boolean') {
                    // TEST Make sure values still changing when using resolved as switch
                    userConfig.search.scanDirectories = value;
                    dlogConfValueLoaded('search.scanDirectories', value)
                    // dlogConfInfo(chalk.magenta(`search.scanDirectories set=${boolFmt(manPaths)}`));
                } else {
                    clogConfBad(`Value of search.scanDirectories must be a boolean but was not: ${value}`);
                }
                break;
            }
            case 'scanRecursively': {
                if (typeof value === 'boolean') {
                    userConfig.search.scanRecursively = value;
                    // dlogConfigStatus(`search.scanRecursively set=${boolFmt(value)}`);
                    dlogConfInfo(clr.magenta(`search.scanRecursively set=${boolFmt(value)}`));
                } else {
                    clogConfBad(`Value of search.scanRecursively must be a boolean but was not: ${value}`);
                }
                break;
            }
            case `manifests`: {
                if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
                    const okManifests = await makeManifestsArray(value, userConfig);

                    userConfig.search.manifests = okManifests;
                    dlogConfInfo(`search.manifests set=${delimitedList(value)}`);
                    dlogConfInfo(clr.magenta(`search.manifests set=${delimitedList(value)}`));
                    
                    if (okManifests.length === 0) {
                        clog(clr.yellow(`No manifest paths were loaded from the ${USER_CONFIG_FILENAME}`));
                    } else if (okManifests.length > 0) {
                        clog(clr.blue(`${okManifests.length} manifests were loaded from the ${USER_CONFIG_FILENAME}`));
                    } 
                } else {
                    if (!Array.isArray(value)) {
                        clogConfBad('Value of search.manifests must be array of strings but was not an array');
                    } else {
                        clogConfBad('All entries of search.manifests must be a string but at least one was not');
                    }
                }
                break;
            }
            default: {
                const unknownKey = `"search.${value}"`;
                clogConfWarn(`Unknown ${USER_CONFIG_FILENAME} key was set at ${unknownKey}`);
            }
        }
    }



    return userConfig;
}


// MARK: Output
async function parseOutputSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('output'))
        throw new Error(clr.red('User Config is missing required section "search"'));

    return userConfig;
}

// MARK: Validate
async function parseValidateSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('validate'))
        throw new Error(clr.red('User Config is missing required section "search"'));
    

    return userConfig;
}

// MARK: Other
async function parseOtherSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('search'))
        throw new Error(clr.red('User Config is missing required section "search"'));

    return userConfig;
}

// MARK: Logs
async function parseLogsSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('logs'))
        throw new Error(clr.red('User Config is missing required section "search"'));

    return userConfig;
}