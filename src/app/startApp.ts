import clr from 'chalk';
import parseUserConfigData from '../config/loadConfig.js';
import { UserConfig } from '../config/type/UserConfig.js';
import { clog } from '../util/logging/console.js';
import { dlog, isVerbose } from '../util/logging/debug.js';
import * as fmt from '../util/string/format.js';
import { countNoun, possessivePronounFor } from '../util/string/grammar.js';
import { SB_SECT_END_OK, SB_SECT_START, SB_WARN } from '../util/string/symbols.js';
import { Manifest } from './type/Manifest.js';
import { findConfig } from '../config/findConfig.js';

async function processManifest(manifest: Manifest, config: UserConfig): Promise<void> {
	// TODO Additionally validate if write path is valid, make folders if missing
	// TODO If it's a file, write to the file, but if it's a folder, write the file inside of the folder, maybe based on the input file's name

	const { shortcuts } = manifest;

	if (!Array.isArray(shortcuts))
		throw new Error(
			`Manifest (${manifest.name} requires a key "shortcuts" which is a list of paths, but the user config is set to a non-array type`,
		);

	// TODO Move much of this logic elsewhere so these things can be triggered on demand

	try {
		const writeResults = await manifest.writeToOutput();
		await manifest.logWriteResults(writeResults, config);
	} catch {
		throw new Error(
			`An error occurred while writing an output manifest (Manifest: ${manifest.name})`,
		);
	}
}

export function listLoadedManifests(config: UserConfig): void {
	const { manifests } = config;
	const manLen = manifests.length;

	if (manLen <= 0) {
		clog(`${SB_WARN} There are no configured manifests to display.`); // TODO Point user to config
		return;
	}

	clog(`${clr.magentaBright.bold('Configured Manifests (' + manLen + ')')}`);

	for (const man of manifests) {
		clog(man.formatAsListEntry());
	}
}

export async function listShortcutsOfLoadedManifests(config: UserConfig): Promise<void> {
	const { manifests } = config.search;
	const manLen = manifests.length;
	const SB_HINT = clr.yellow('!');

	if (manLen <= 0) {
		clog(
			`${SB_WARN} There are no configured manifests to display, hence there are no shortcuts either.`,
		);
		return;
	}

	let allScLen = 0;

	for (const man of manifests) {
		const scLen = man.enabledShortcuts.length;
		allScLen += scLen;
	}

	// TODO Option to list all shortcuts, including those that are disabled or invalid

	if (allScLen <= 0) {
		clog(
			`${SB_WARN} No enabled, valid shortcuts were found out of ${manLen} configured manifests.`,
		);
		clog(
			`  ${SB_HINT} To view list of manifests, execute ${clr.yellow('srmg list manifests')}`,
			`  ${SB_HINT} To view all shortcuts, execute ${clr.yellow('srmg list shortcuts --all')}`, // TODO Maybe syntax should be `srmg list shortcuts all` ?
		);
		return;
	}

	clog(
		`${clr.cyanBright.bold('Configured Shortcuts (' + allScLen + ' Valid Shortcuts from ' + manLen + ' Manifests)')}`,
	);
	clog(
		`  ${SB_HINT} If shortcuts are missing, execute ${clr.yellow('srmg list shortcuts --all')}`,
	);

	for (const man of manifests) {
		// TODO Replace with index identifier
		clog(`${clr.magentaBright.bold(`Manifest "${man.name}"`)}`);

		const allScLen = man.shortcuts.length;
		const enabledLen = man.enabledShortcuts.length;

		if (enabledLen <= 0) {
			if (allScLen <= 0) {
				clog(` ${SB_WARN} There are no configured shortcuts for this manifest`);
			} else {
				clog(
					` ${SB_WARN} There are no enabled, valid shortcuts for this manifest (${allScLen} configured)`,
				);
			}

			continue;
		}

		for (const sc of man.enabledShortcuts) {
			const lines = await sc.formatAsListEntry(man.baseDirectory, config);
			lines.forEach(line => clog(line));
		}
	}
}

// export function listShortcutsOfGivenManifest(manifest: Manifest): void {
// 	// TODO
// }

export async function transformLoadedManifests(config: UserConfig): Promise<void> {
	const { manifests } = config;
	const manLen = manifests.length;

	if (manLen <= 0) {
		clog(
			`${SB_WARN} Could not transform loaded manifests because there were none loaded`,
		);
		return;
	}

	const subject = countNoun(manLen, 'YAML manifest');
	const pronoun = possessivePronounFor(manLen);
	const object = countNoun(manLen, 'JSON equivalent');
	dlog(`${SB_SECT_START}Transforming: ${manLen} ${subject} into ${pronoun} ${object}`);

	if (isVerbose()) {
		for (const man of manifests) {
			clog(man.formatAsListEntry());
		}
	}

	let okLen = 0;

	for (const man of manifests) {
		try {
			await processManifest(man, config);
			okLen++;
		} catch {
			console.error(
				clr.red(`Error processing manifest ${fmt.pathAsTag(man.filePath)}`),
			);
		}
	}

	// TODO More responsive print
	dlog(
		`${SB_SECT_END_OK}Transformed: ${okLen} out of ${manLen} manifests into JSON output`,
	);
}

export async function startApp(): Promise<void> {
	// OLD
	// const userConfig = await parseUserConfigData();
	// await transformLoadedManifests(userConfig);
	
	// NEW
	//const userConfig = await getContextualUserConfigData();
	await findConfig();
	//await transformLoadedManifests(userConfig);
}
