import fs from 'node:fs';
import https from 'node:https';

import clr from 'chalk';
import yaml from 'yaml';

import { clog } from '../util/logging/console.js';
import { quote } from '../util/string/quote.js';
import {
	EXAMPLE_CONFIG_FILENAME,
	EXAMPLE_CONFIG_PATH,
	EXAMPLE_CONFIG_URL,
	USER_CONFIG_FILENAME,
	USER_CONFIG_PATH,
} from './loadConfig.js';

import { vlog } from '../util/logging/debug.js';
import * as fmt from '../util/string/format.js';
import { SB_ERR_LG, SB_OK_LG, SB_WARN } from '../util/string/symbols.js';
import { ConfigData } from './type/ConfigData.js';

// MARK: downloadExampleConfig
/**
 * Attempts to download the example.config.yml from the project repository,
 * writing its contents into the local `./config/example` folder.
 * @returns A `Promise` that resolves to a `boolean` or rejects if
 *   unhandled errors occur.
 */
async function downloadExampleConfig(): Promise<boolean> {
	try {
		await fs.promises.access(EXAMPLE_CONFIG_PATH);
		throw new Error(
			clr.red(
				`downloadExampleConfig was invoked but ${EXAMPLE_CONFIG_PATH} already exists`,
			),
		);
	} catch {
		/* empty */
	}

	return new Promise((resolve, reject) => {
		https
			.get(EXAMPLE_CONFIG_URL, response => {
				if (response.statusCode !== 200)
					return reject(
						new Error(
							`Failed to grab "${EXAMPLE_CONFIG_FILENAME}" from ${fmt.path(EXAMPLE_CONFIG_URL)}". Status code: ${response.statusCode}`,
						),
					);

				const fileStreamExample = fs.createWriteStream(EXAMPLE_CONFIG_PATH),
					fileStreamUser = fs.createWriteStream(USER_CONFIG_PATH);

				response.pipe(fileStreamExample);
				response.pipe(fileStreamUser);

				let finishedStreams = 0;

				const onStreamFinish = (): void => {
					finishedStreams += 1;
					if (finishedStreams === 2) {
						resolve(true);
					}
				};

				fileStreamExample.on('finish', () => {
					clog(
						`${SB_OK_LG} Restored "${EXAMPLE_CONFIG_FILENAME}" from GitHub ${fmt.pathAsTag(EXAMPLE_CONFIG_PATH)}`,
					);
					onStreamFinish();
				});
				fileStreamUser.on('finish', () => {
					clog(
						`${SB_OK_LG} Copied "${EXAMPLE_CONFIG_FILENAME}" to ${fmt.path(USER_CONFIG_PATH)}`,
					);
					onStreamFinish();
				});

				const onError = (err: Error): void => {
					fileStreamExample.close(() =>
						fs.unlink(EXAMPLE_CONFIG_PATH, err => {
							if (err) {
								console.error(
									`Something went wrong while closing file handle for ${EXAMPLE_CONFIG_FILENAME}:`,
									err?.message,
								);
							}
						}),
					);
					fileStreamUser.close(() =>
						fs.unlink(USER_CONFIG_PATH, err => {
							if (err) {
								console.error(
									`Something went wrong while closing file handle for ${USER_CONFIG_FILENAME}:`,
									err?.message,
								);
							}
						}),
					);
					reject(err);
				};

				fileStreamExample.on('error', onError);
				fileStreamUser.on('error', onError);
			})
			.on('error', reject);
	});
}

// MARK: copyExampleConfigToUserConfigPath
/**
 * Attempts to copy the file at {@link EXAMPLE_CONFIG_PATH} to the
 * {@link USER_CONFIG_PATH}.
 *
 * @returns A Promise which resolves to undefined if resolved, or otherwise
 *   rejects when an unhandled error occurs.
 */
async function copyExampleConfigToUserConfigPath(): Promise<void> {
	try {
		await fs.promises.access(USER_CONFIG_PATH);
		throw new Error(
			clr.red(
				`Unexpected: copyExampleConfigToUserConfigPath was invoked but ${USER_CONFIG_PATH} already exists`,
			),
		);
	} catch {
		/* empty */
	}

	try {
		const exampleConfigFile = await fs.promises.readFile(EXAMPLE_CONFIG_PATH, 'utf8');
		await fs.promises.writeFile(USER_CONFIG_PATH, exampleConfigFile, 'utf8');
		clog(`${SB_OK_LG} Example config copied to ${fmt.path(USER_CONFIG_PATH)}`);
	} catch (err) {
		console.error(
			`${SB_ERR_LG} Failed to copy example config to ${USER_CONFIG_PATH}:`,
			err,
		);
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
export async function loadUserConfigData(): Promise<object> {
	let exampleConfigHandle;
	let userConfigHandle;

	const tagExampleConfPath = fmt.pathAsTag(EXAMPLE_CONFIG_PATH);
	const tagUserConfPath = fmt.pathAsTag(USER_CONFIG_PATH);

	vlog(clr.magentaBright.underline(`CHECKING FOR CONFIGS`));

	try {
		exampleConfigHandle = await fs.promises.open(EXAMPLE_CONFIG_PATH, 'r');
		vlog(`${SB_OK_LG} Example config exists ${tagExampleConfPath}`);
	} catch {
		// TODO Allow disabling this in the config
		// TODO Maybe take input from user?
		clog(
			`${SB_WARN} Example config was missing from its typical location ${tagExampleConfPath}`,
			`- A new copy of the ${quote(EXAMPLE_CONFIG_FILENAME)} will be downloaded from GitHub...`, // TODO Review this styling
			`  > URL: ${fmt.path(EXAMPLE_CONFIG_URL)}`,
			`  > Downloading To: ${fmt.path(EXAMPLE_CONFIG_PATH)}`,
			`  > Then Copying To: ${fmt.path(USER_CONFIG_PATH)}`,
		);

		await downloadExampleConfig();
	}

	try {
		// Check that user config file exists
		userConfigHandle = await fs.promises.open(USER_CONFIG_PATH, 'r');
		vlog(`${SB_OK_LG} User config exists ${tagUserConfPath}`);
	} catch {
		// User config is missing
		try {
			// Check if example config is in place, copy it to the user's config path if present
			exampleConfigHandle = await fs.promises.open(EXAMPLE_CONFIG_PATH, 'r');
			clog(
				` ${SB_ERR_LG} No "${USER_CONFIG_FILENAME}" was found at the expected path. Some configuration is required for SRM Manifest Generator to function.`,
			);
			clog(
				` ... Attempting to create a new default config based on ${EXAMPLE_CONFIG_FILENAME}`,
			);
			await copyExampleConfigToUserConfigPath();
		} catch {
			// If both are missing, try to fetch the latest copy of the example config from repo
			clog(
				`SRM Manifest Generator is missing a ${USER_CONFIG_PATH}, but the ${EXAMPLE_CONFIG_FILENAME} has been deleted.`,
			);
			clog(
				`Restoring ${EXAMPLE_CONFIG_PATH} with latest version from GitHub (URL below), then creating a new default ${USER_CONFIG_FILENAME} based on ${EXAMPLE_CONFIG_FILENAME}...`,
			);
			await downloadExampleConfig();
		}
	} finally {
		if (userConfigHandle) await userConfigHandle.close();
		if (exampleConfigHandle) await exampleConfigHandle.close();
	}

	const fileContents = await fs.promises.readFile(USER_CONFIG_PATH, 'utf8');
	const configData: object = yaml.parse(fileContents) as ConfigData;

	return configData;
}

export async function loadExampleConfigData(): Promise<ConfigData> {
	const fileContents = await fs.promises.readFile(EXAMPLE_CONFIG_PATH, 'utf8');
	return JSON.parse(fileContents) as ConfigData;
}