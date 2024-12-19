import clr from 'chalk';

import Manifest from './type/manifest/Manifest.js';

import parseUserConfigData from './config/config.js';
import ConfigData from './type/config/ConfigData.js';
import Shortcut from './type/shortcut/Shortcut.js';
import { yesNo } from './utility/boolean.js';
import { clog } from './utility/console.js';
import { isVerbose } from './utility/debug.js';
import { fmtPathAsTag, fmtPathWithExistsPrefix } from './utility/path.js';
import { quote } from './utility/string-wrap.js';
import { SB_OK_LG, SB_WARN } from './utility/symbols.js';

async function processManifest(manifest: Manifest): Promise<void> {
	// TODO Additionally validate if write path is valid, make folders if missing
	// TODO If it's a file, write to the file, but if it's a folder, write the file inside of the folder, maybe based on the input file's name

	const { shortcuts } = manifest;

	if (!Array.isArray(shortcuts))
		throw new Error(
			`Manifest (${manifest.getName()} requires a key "shortcuts" which is a list of paths, but the user config is set to a non-array type`,
		);

	// TODO Move much of this logic elsewhere so these things can be triggered on demand

	try {
		const writeResults = await manifest.writeToOutput();
		await manifest.logWriteResults(writeResults);
	} catch {
		throw new Error(
			`An error occurred while writing an output manifest (Manifest: ${manifest.getName()})`,
		);
	}
}

function fmtManifestAsListEntry(manifest: Manifest): string {
	let item = ' - ';
	item += manifest.getName();
	// TODO Display some sort of status
	return item;
}

export function listLoadedManifests(config: ConfigData): void {
	const { manifests } = config.search;
	const manLen = manifests.length;

	if (manLen <= 0) {
		clog(`${SB_WARN} There are no configured manifests to display.`); // TODO Point user to config
		return;
	}

	clog(`${clr.magentaBright.bold('Configured Manifests (' + manLen + ')')}`);

	for (const man of manifests) {
		clog(fmtManifestAsListEntry(man));
	}
}

async function fmtShortcutAsListEntry(
	shortcut: Shortcut,
	parentManifest: Manifest,
): Promise<Array<string>> {
	const fmtTitle = quote(shortcut.getTitle);
	const fullTarget = shortcut.getFullTargetPath(parentManifest);
	const fmtFullTarget = await fmtPathWithExistsPrefix(fullTarget);
	const fmtIsEnabled = yesNo(shortcut.isEnabled);

	return [
		` - Title: ${fmtTitle}`,
		`   Target: ${fmtFullTarget}`,
		`   Enabled? ${fmtIsEnabled}`,
	];
}

export async function listShortcutsOfLoadedManifests(config: ConfigData): Promise<void> {
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
		const scLen = man.getEnabledShortcuts().length;
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
		clog(`${clr.magentaBright.bold(`Manifest "${man.getName()}"`)}`);

		const allScLen = man.getShortcuts().length;
		const enabledShortcuts = man.getEnabledShortcuts();

		if (enabledShortcuts.length <= 0) {
			if (allScLen <= 0) {
				clog(` ${SB_WARN} There are no configured shortcuts for this manifest`);
			} else {
				clog(
					` ${SB_WARN} There are no enabled, valid shortcuts for this manifest (${allScLen} configured)`,
				);
			}

			continue;
		}

		for (const sc of enabledShortcuts) {
			const lines = await fmtShortcutAsListEntry(sc, man);
			lines.forEach(line => clog(line));
		}
	}
}

export function listShortcutsOfGivenManifest(manifest: Manifest): void {
	// TODO
}

export async function transformLoadedManifests(config: ConfigData): Promise<void> {
	const { manifests } = config.search;
	const manLen = manifests.length;

	if (manLen <= 0) {
		clog(
			`${SB_WARN} Could not transform loaded manifests because there were none loaded`,
		);
		return;
	}

	const noun = manLen === 1 ? 'manifest' : 'manifests';
	clog(`${SB_OK_LG} Found ${clr.green(manLen)} ${noun} to transform into JSON`);
	if (isVerbose()) {
		for (const man of manifests) {
			clog(fmtManifestAsListEntry(man));
		}
	}

	for (const man of manifests) {
		try {
			await processManifest(man);
		} catch {
			console.error(
				clr.red(`Error processing manifest ${fmtPathAsTag(man.filePath)}`),
			);
		}
	}
}

export async function startApp(): Promise<void> {
	const userConfig = await parseUserConfigData();
	await transformLoadedManifests(userConfig);
}
