import fs from 'node:fs/promises';
import path from 'node:path';

import clr from 'chalk';

import { UserConfig } from './type/UserConfig.js';

import { dlogHeader } from '../util/logging/debug.js';
import parseLogSection from './parseSection/log.js';
import parseSearchSection from './parseSection/search.js';
import parseTransformSection from './parseSection/transform.js';
import parseValidateSection from './parseSection/validate.js';
import { loadUserConfigData } from './readFile.js';
import { ConfigData } from './type/ConfigData.js';
import { createDefaultConfigData } from './type/DefaultConfig.js';

export const EXAMPLE_CONFIG_FILENAME = 'example.config.yml',
	EXAMPLE_CONFIG_PATH = path.join('config', 'example', EXAMPLE_CONFIG_FILENAME),
	EXAMPLE_CONFIG_URL = `https://raw.githubusercontent.com/tsgrissom/srm-manifest-generator/refs/heads/main${EXAMPLE_CONFIG_PATH}`;
// TODO How can I get this last one dynamically?

//export const USER_CONFIG_FILENAME = 'config.yml',
	//USER_CONFIG_PATH = path.join('config', USER_CONFIG_FILENAME),
	//USER_CONFIG_PFX = 'Config',
	//USER_CONFIG_ATTRIBUTION = `User ${USER_CONFIG_FILENAME}`;

export const fallbackConfigSearchPaths: Array<string> = [
    path.join('config', 'config.yml'),
];

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

async function parseSections(rawData: object, parsedData: ConfigData): Promise<ConfigData> {
	parsedData = parseValidateSection(rawData, parsedData);
	parsedData = parseLogSection(rawData, parsedData);
	parsedData = parseTransformSection(rawData, parsedData);
	parsedData = await parseSearchSection(rawData, parsedData);
	return parsedData;
}

// TODO Consider re-doing with typeguard
async function parseUserConfigData(): Promise<UserConfig> {
	const rawData = await loadData();

	if (!rawData) {
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

	const isObject = typeof rawData === 'object';
	const isArray = Array.isArray(rawData);

	if (!isObject || isArray) {
		if (!isObject) {
			logConfErrMalformed(
				`Expected file contents to be of type object, but was actually a ${typeof rawData}`,
			);
		} else if (isArray) {
			logConfErrMalformed(
				`Expected file contents to be of type object, but was actually an array.`,
			);
		}

		process.exit();
	}

	dlogHeader('LOADING USER CONFIG');

	let parsedData: ConfigData = createDefaultConfigData();
	parsedData = await parseSections(rawData, parsedData);
	return new UserConfig(parsedData);
}

export default parseUserConfigData;
