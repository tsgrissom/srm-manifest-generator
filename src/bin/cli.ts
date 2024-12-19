#!/usr/bin/env node

import chalk from 'chalk';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { listLoadedManifests, listShortcutsOfLoadedManifests, startApp } from '../app.js';
import parseUserConfigData from '../config/config.js';
import { quote } from '../utility/string-wrap.js';
import { delimitedList } from '../utility/string.js';

const ALIASES_MANIFEST = ['manifest', 'manifests', 'man', 'source', 'sources'];
const ALIASES_SHORTCUT = [
	'shortcut',
	'shortcuts',
	'sc',
	'short',
	'titles',
	'title',
	'games',
	'game',
	'roms',
	'rom',
];
const ALIASES_LIST_CATEGORIES = [
	'categories',
	'category',
	'types',
	'type',
	'options',
	'option',
];

const LIST_ALL_CATEGORIES = Array.from(
	new Set([...ALIASES_LIST_CATEGORIES, ...ALIASES_MANIFEST, ...ALIASES_SHORTCUT]),
);
const LIST_RECOMMENDED_CATEGORIES = ['categories', 'manifests', 'shortcuts'];

// TODO Handle no config

await yargs(hideBin(process.argv))
	.scriptName('srmg')
	.command(
		'list [category]',
		'list things recognized by srm manifest generator',
		yargs => {
			return yargs.positional('category', {
				desc: 'the kind of things to list',
				type: 'string',
				choices: LIST_ALL_CATEGORIES,
				default: 'manifests',
			});
		},
		async argv => {
			const { category } = argv;
			const categoryLow = category.toLowerCase();

			if (ALIASES_LIST_CATEGORIES.includes(categoryLow)) {
				listCategories();
			} else if (ALIASES_MANIFEST.includes(categoryLow)) {
				await listManifests();
			} else if (ALIASES_SHORTCUT.includes(categoryLow)) {
				await listShortcuts();
			} else {
				listCategories(category);
			}
		},
	)
	.command(
		'run',
		'run srm manifest generator transformations',
		yargs => {},
		async argv => {
			await startApp();
		},
	)
	.demandCommand(1, 'You must enter at least one command')
	.parse();

function listCategories(unknownGiven?: string): void {
	if (unknownGiven !== undefined) {
		console.log(chalk.red(`Unknown list category: ${quote(unknownGiven)}`));
		console.log(
			chalk.red(`Valid categories: ${delimitedList(LIST_RECOMMENDED_CATEGORIES)}`),
		);
	} else {
		console.log(`Valid categories: ${delimitedList(LIST_RECOMMENDED_CATEGORIES)}`);
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
