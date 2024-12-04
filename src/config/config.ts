/* eslint-disable @typescript-eslint/no-explicit-any */
// Disabled for special config clog and dlog functions

import fs from 'node:fs';
import path from 'node:path';

import clr from 'chalk';

import { clog } from '../utility/console.js';
import { isDebugActive } from '../utility/debug.js';
import { fmtBool } from '../utility/boolean.js';

import UserConfig from '../type/config/UserConfig.js';

import { loadUserConfigData } from './load-data.js';
import ConfigData from '../type/config/ConfigData.js';
import parseSearchSection from './parse/section/section-search.js';
import parseValidateSection from './parse/section/section-validate.js';
import parseOutputSection from './parse/section/section-output.js';
import parseOtherSection from './parse/section/section-other.js';
import parseLogsSection from './parse/section/section-logs.js';
import { SB_ERR_LG, SB_OK_LG, SB_OK_SM, SB_WARN } from '../utility/string.js';

export const EXAMPLE_CONFIG_FILENAME = 'example.config.yml';
export const EXAMPLE_CONFIG_PATH = path.join('config', 'example', EXAMPLE_CONFIG_FILENAME);
export const EXAMPLE_CONFIG_URL = `https://raw.githubusercontent.com/tsgrissom/srm-manifest-generator/refs/heads/main${EXAMPLE_CONFIG_PATH}`;

export const README_URL = 'https://github.com/tsgrissom/srm-manifest-generator'; // TODO Get from package.json

export const USER_CONFIG_FILENAME = 'config.yml';
export const USER_CONFIG_PATH = path.join('config', USER_CONFIG_FILENAME) // PATH_EXAMPLE_CONFIG;
export const USER_CONFIG_PFX = 'Config';

export const clogConfInfo = (msg?: any) =>
    clog(`User Config: ` + msg);
    // clog(` > ` + USER_CONFIG_PFX + `: ${msg}`);
export const clogConfOk   = (msg?: any) =>
    clog(` > ` + USER_CONFIG_PFX + ` ` + SB_OK_LG + ` ${msg}`);
export const clogConfSucc = (emphasis: boolean, msg?: any) =>
    clog(` ` + (emphasis ? SB_OK_LG : SB_OK_SM) + ` ` + USER_CONFIG_PFX + `: ${msg}`);
export const clogConfBad2 = (msg?: any) =>
    clog(` ` + SB_ERR_LG + ` ` + USER_CONFIG_PFX + `: ${msg}`);
export const clogConfWarn = (msg?: any) =>
    console.warn(` ` + SB_WARN + ` ` + USER_CONFIG_PFX + `: ${msg}`);
    // console.warn(clr.yellow(USER_CONFIG_PFX) + `: ${msg}`);
export const clogConfErr  = (msg?: any) =>
    console.error(clr.red(USER_CONFIG_PFX) + `: ${msg}`);
export const clogConfInvalid = (msg: string) => {
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
        fmtValue = fmtBool(value);

    clogConfSucc(false, `Value of "${key}" set=${fmtValue}`);
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

async function parseUserConfigData() : Promise<ConfigData> {
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

export default parseUserConfigData;