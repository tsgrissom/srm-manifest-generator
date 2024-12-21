#!/usr/bin/env node

import clr from 'chalk';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import {
	listLoadedManifests,
	listShortcutsOfLoadedManifests,
	startApp,
} from '../app/startApp.js';
import { Manifest } from '../app/type/Manifest.js';
import { USER_CONFIG_PATH } from '../config/loadFileData.js';
import parseUserConfigData from '../config/parseConfigData.js';
import { ConfigData } from '../config/type/ConfigData.js';
import { BoolFmtPreset, fmtBool, yesNo } from '../util/boolean.js';
import { fmtPath } from '../util/file/path.js';
import { clog, clogList } from '../util/logging/console.js';
import { delimitedList } from '../util/string/grammar.js';
import { SB_ERR_LG } from '../util/string/symbols.js';
import { quote } from '../util/string/wrap.js';

// General Constants

const aliasesManifestType = ['manifests', 'manifest', 'man', 'source', 'sources'];
// prettier-ignore
const aliasesShortcutType = ['shortcuts', 'shortcut', 'sc', 'short', 'titles', 'title', 'games', 'game', 'roms', 'rom'];

// Command "config" Constants

const cmdConfigAliases = ['config', 'conf'];

// Command "list" Constants

const cmdListAliases = ['list [category]', 'ls [category]'];
// prettier-ignore
const cmdListAliasesForCategoriesCategory = ['categories', 'category', 'types', 'type', 'options', 'option'];
const cmdListRecommendedCategories = ['categories', 'manifests', 'shortcuts'];
const cmdListAllCategories = Array.from(
	new Set([
		...cmdListAliasesForCategoriesCategory,
		...aliasesManifestType,
		...aliasesShortcutType,
	]),
);

// Command "run" Constants

// Command "shortcuts" Constants

// Command "manifests" Constants

// TODO Handle no config

await yargs(hideBin(process.argv))
	.scriptName('srmg')
	.command(
		cmdConfigAliases,
		'read, validate, or alter the user config',
		() => {},
		async () => {
			const config = await parseUserConfigData();
			displayUserConfig(config);
			displayUserConfigInstructions(config);
		},
	)
	.command(
		cmdListAliases,
		'list things srm generator recognizes',
		yargs => {
			return yargs.positional('category', {
				desc: 'the kind of things to list',
				type: 'string',
				choices: cmdListAllCategories,
				default: 'manifests',
			});
		},
		async argv => {
			const { category } = argv;
			const categoryLow = category.toLowerCase();

			if (cmdListAliasesForCategoriesCategory.includes(categoryLow)) {
				listCategories();
			} else if (aliasesManifestType.includes(categoryLow)) {
				await listManifests();
			} else if (aliasesShortcutType.includes(categoryLow)) {
				await listShortcuts();
			} else {
				listCategories(category);
			}
		},
	)
	.command(
		'run',
		'run transformations',
		() => {},
		async () => {
			await startApp();
		},
	)
	.command(
		aliasesManifestType,
		'display and interact with manifests',
		() => {},
		async () => {
			await listManifests();
		},
	)
	.command(
		aliasesShortcutType,
		'display and interact with shortcuts',
		() => {},
		async () => {
			await listShortcuts();
		},
	)
	.demandCommand(1, 'You must enter at least one command')
	.parse();

function fmtPretty(value?: unknown): string {
	switch (typeof value) {
		case 'boolean':
			return fmtBool(value, BoolFmtPreset.EnabledDisabled);
		case 'number':
			return clr.cyanBright(value);
		case 'object':
			if (Array.isArray(value)) {
				if (value.every(element => typeof element === 'string')) {
					return delimitedList(value.map(element => quote(element)));
				} else {
					return delimitedList(value);
				}
			} else {
				return 'OBJECT';
			}
		case 'string':
			return quote(value);
		case 'undefined':
			return clr.redBright('undefined');
		default:
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return `${value as any}`;
	}
}

function displayUserConfigSection(key: string, obj: object): void {
	clog(clr.bold(`Section ${quote(key)}:`));
	// TODO Support recursive subsection pretty print
	for (const [innerKey, innerValue] of Object.entries(obj)) {
		if (innerKey === 'manifests') {
			if (
				!Array.isArray(innerValue) ||
				!innerValue.every(element => typeof element === 'object')
			) {
				clog(`  manifests: ${clr.redBright('INVALID')}`);
				continue;
			}

			const manPaths = innerValue
				.map(each => each as Manifest)
				.map(man => man.getFilePath);

			clog(`  manifests:`);
			clogList(`   - `, ...manPaths);
			continue;
		}

		clog(`  ${innerKey}: ${fmtPretty(innerValue)}`);
	}
}

function displayUserConfig(config?: object): void {
	if (typeof config === 'undefined') {
		clog(``, `${SB_ERR_LG} There is no user configuration file`, ``);
		return;
	}

	const configWithoutFunctions = Object.fromEntries(
		Object.entries(config).filter(([key, value]) => typeof value !== 'function'),
	);

	clog('', clr.magentaBright.bold(`CURRENT USER CONFIG`));
	for (const [key, value] of Object.entries(configWithoutFunctions)) {
		if (typeof value === 'object') {
			// a section
			displayUserConfigSection(key, value as object);
		}
	}
	// console.log(configWithoutFunctions);
	clog('');
}

function displayUserConfigInstructions(config?: ConfigData): void {
	const wasFound = true; // TODO Dynamic
	const configPath = USER_CONFIG_PATH;
	let lineLocation = wasFound ? ` - Location: ` : ` - Location set to: `;

	lineLocation += clr.yellowBright(fmtPath(configPath));

	clog(
		clr.magentaBright.bold(`INSTRUCTIONS FOR USER CONFIG`),
		` - Was found? ${yesNo(wasFound)}`,
		lineLocation,
		``,
	);
}

function listCategories(unknownGiven?: string): void {
	if (unknownGiven !== undefined) {
		console.log(clr.red(`Unknown list category: ${quote(unknownGiven)}`));
		console.log(
			clr.red(`Valid categories: ${delimitedList(cmdListRecommendedCategories)}`),
		);
	} else {
		console.log(`Valid categories: ${delimitedList(cmdListRecommendedCategories)}`);
	}
}

async function listManifests(): Promise<void> {
	const userConfig = await parseUserConfigData();
	listLoadedManifests(userConfig);
}

async function listShortcuts(): Promise<void> {
	const userConfig = await parseUserConfigData();
	await listShortcutsOfLoadedManifests(userConfig);
}
