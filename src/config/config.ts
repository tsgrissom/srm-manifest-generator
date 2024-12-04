/* eslint-disable @typescript-eslint/no-explicit-any */
// Disabled for special config clog and dlog functions

import fs from 'node:fs';
import path from 'node:path';

import clr from 'chalk';

import { clog } from '../utility/console.js';
import { dlog, isDebugActive } from '../utility/debug.js';
import { fmtBool } from '../utility/boolean.js';

import UserConfig from '../type/config/UserConfig.js';

import { loadUserConfigData } from './load-data.js';
import ConfigData from '../type/config/ConfigData.js';
import parseSearchSection from './parse/section/section-search.js';
import parseValidateSection from './parse/section/section-validate.js';
import parseOutputSection from './parse/section/section-output.js';
import parseOtherSection from './parse/section/section-other.js';
import parseLogsSection from './parse/section/section-logs.js';
import { quote, SB_ERR_LG, SB_OK_LG, SB_OK_SM, SB_WARN } from '../utility/string.js';

export const EXAMPLE_CONFIG_FILENAME = 'example.config.yml';
export const EXAMPLE_CONFIG_PATH = path.join('config', 'example', EXAMPLE_CONFIG_FILENAME);
export const EXAMPLE_CONFIG_URL = `https://raw.githubusercontent.com/tsgrissom/srm-manifest-generator/refs/heads/main${EXAMPLE_CONFIG_PATH}`;

export const README_URL = 'https://github.com/tsgrissom/srm-manifest-generator'; // TODO Get from package.json

export const USER_CONFIG_FILENAME = 'config.yml';
export const USER_CONFIG_PATH = path.join('config', USER_CONFIG_FILENAME) // PATH_EXAMPLE_CONFIG;
export const USER_CONFIG_PFX = 'Config';
export const USER_CONFIG_ATTRIBUTION = `User ${USER_CONFIG_FILENAME}`;

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

    dlog(clr.magenta.underline('LOADING USER CONFIG'));

    let userConfig = new UserConfig();

    userConfig = await parseOutputSection(userConfigData, userConfig);
    userConfig = await parseValidateSection(userConfigData, userConfig);
    userConfig = await parseOtherSection(userConfigData, userConfig);
    userConfig = await parseLogsSection(userConfigData, userConfig);
    userConfig = await parseSearchSection(userConfigData, userConfig);

    return userConfig;
}

export default parseUserConfigData;