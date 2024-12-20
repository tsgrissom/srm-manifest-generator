import fs from 'node:fs/promises';
import path from 'node:path';

import clr from 'chalk';

import { dlogHeader } from '../util/debug.js';

import ConfigData from '../type/config/ConfigData.js';
import UserConfig from '../type/config/UserConfig.js';

import { loadUserConfigData } from './load-data.js';
import parseLogsSection from './parse/section/section-logs.js';
import parseOtherSection from './parse/section/section-other.js';
import parseOutputSection from './parse/section/section-output.js';
import parseSearchSection from './parse/section/section-search.js';
import parseValidateSection from './parse/section/section-validate.js';

export const EXAMPLE_CONFIG_FILENAME = 'example.config.yml',
	EXAMPLE_CONFIG_PATH = path.join('config', 'example', EXAMPLE_CONFIG_FILENAME),
	EXAMPLE_CONFIG_URL = `https://raw.githubusercontent.com/tsgrissom/srm-manifest-generator/refs/heads/main${EXAMPLE_CONFIG_PATH}`;
// TODO How can I get this last one dynamically?

export const USER_CONFIG_FILENAME = 'config.yml',
	USER_CONFIG_PATH = path.join('config', USER_CONFIG_FILENAME),
	USER_CONFIG_PFX = 'Config',
	USER_CONFIG_ATTRIBUTION = `User ${USER_CONFIG_FILENAME}`;

// MARK: LOAD + PARSE

const logUrlToExampleConf = (): void => {
	const urlStyled = clr.redBright.underline(EXAMPLE_CONFIG_URL);
	console.error(`For an example config, please see: ${urlStyled}`);
};

const logConfErrMalformed = (msg: string): void => {
	console.error(`User ${clr.redBright(USER_CONFIG_FILENAME)} is malformed: ${msg}`);
	logUrlToExampleConf();
};

const logConfGenericLoadErr = (msg: string): void => {
	console.error(clr.red(msg));
	logUrlToExampleConf();
};

async function loadData(): Promise<object> {
	try {
		const data = await loadUserConfigData();
		return data;
	} catch {
		throw new Error(`Failed to load user config data`);
	}
}

async function parseUserConfigData(): Promise<ConfigData> {
	const userConfigData = await loadData();

	if (!userConfigData) {
		const userConfName = clr.redBright(USER_CONFIG_FILENAME);

		// TODO Test and see how this looks
		try {
			await fs.access(USER_CONFIG_PATH);
			logConfGenericLoadErr(`Your ${userConfName} cannot be empty.`);
		} catch {
			logConfGenericLoadErr(
				`You must create a ${userConfName} to use SRM Manifest Generator.`,
			);
		}

		process.exit();
	}

	const isObject = typeof userConfigData === 'object';
	const isArray = Array.isArray(userConfigData);

	if (!isObject || isArray) {
		if (!isObject) {
			logConfErrMalformed(
				`Expected file contents to be of type object, but was actually a ${typeof userConfigData}`,
			);
		} else if (isArray) {
			logConfErrMalformed(
				`Expected file contents to be of type object, but was actually an array.`,
			);
		}

		process.exit();
	}

	dlogHeader('LOADING USER CONFIG');

	let userConfig = new UserConfig();

	userConfig = parseOutputSection(userConfigData, userConfig);
	userConfig = parseValidateSection(userConfigData, userConfig);
	userConfig = parseOtherSection(userConfigData, userConfig);
	userConfig = parseLogsSection(userConfigData, userConfig);
	userConfig = await parseSearchSection(userConfigData, userConfig);

	return userConfig;
}

export default parseUserConfigData;
