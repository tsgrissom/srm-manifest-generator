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
import parseUserConfigData, { USER_CONFIG_PATH } from '../config/loadConfig.js';
import { clog, clogList } from '../util/logging/console.js';
import * as fmt from '../util/string/format.js';
import { delimitedList } from '../util/string/grammar.js';
import { quote } from '../util/string/quote.js';
import { SB_ERR_LG } from '../util/string/symbols.js';

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
			displayUserConfigInstructions();
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
			return fmt.bool(value, fmt.boolPresets.enabledDisabled);
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
				.map(man => man.filePath);

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
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		Object.entries(config).filter(([_, value]) => typeof value !== 'function'),
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

function displayUserConfigInstructions(): void {
	const wasFound = true; // TODO Dynamic
	const configPath = USER_CONFIG_PATH;
	let lineLocation = wasFound ? ` - Location: ` : ` - Location set to: `;

	lineLocation += clr.yellowBright(fmt.path(configPath));

	clog(
		clr.magentaBright.bold(`INSTRUCTIONS FOR USER CONFIG`),
		` - Was found? ${fmt.yesNo(wasFound)}`,
		lineLocation,
		``,
	);
}

function listCategories(unknownGiven?: string): void {
	if (unknownGiven !== undefined) {
		clog(
			clr.red(`Unknown list category: ${quote(unknownGiven)}`),
			clr.red(`Valid categories: ${delimitedList(cmdListRecommendedCategories)}`),
		);
	} else {
		clog(`Valid categories: ${delimitedList(cmdListRecommendedCategories)}`);
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
