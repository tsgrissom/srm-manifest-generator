import clr from 'chalk';

import Manifest from './type/manifest/Manifest';

import parseUserConfigData from './config/config';
import { fmtPathAsTag } from './utility/path';

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

async function startApp(): Promise<void> {
	const userConfig = await parseUserConfigData();
	const { manifests } = userConfig.search;

	for (const manifest of manifests) {
		try {
			await processManifest(manifest); // TODO This doesn't need to always happen automatically
		} catch {
			console.error(
				clr.red(`Error processing manifest ${fmtPathAsTag(manifest.filePath)}`),
			);
		}
	}
}

export default startApp;
