import clr from 'chalk';

import { clog } from './utility/console.js';
import { dlog } from './utility/debug.js';

import Manifest from './type/manifest/Manifest.js';

import parseUserConfigData from './config/config.js';

async function processManifest(manifest: Manifest) {
    // TODO Additionally validate if write path is valid, make folders if missing
    // TODO If it's a file, write to the file, but if it's a folder, write the file inside of the folder, maybe based on the input file's name
    
    const { name, shortcuts } = manifest.data;
    const manPath = manifest.filePath;

    if (!Array.isArray(shortcuts))
        throw new Error(`Manifest (${manifest.getName()} requires a key "shortcuts" which is a list of paths, but the user config is set to a non-array type`);

    // TODO Move much of this logic elsewhere so these things can be triggered on demand

    try {
        const writeResults = await manifest.writeToOutput();
        await manifest.logWriteResults(writeResults);
        clog(clr.green(`Manifest output has been written to ${manPath}`)); // TODO Better message
    } catch (err) {
        throw new Error(`An error occurred while writing an output manifest (Manifest: ${manifest.getName()}): ${err}`);
    }
}

async function startApp() {
    const userConfig = await parseUserConfigData();
    const { manifests: manifestPaths } = userConfig.search;

    for (const filePath of manifestPaths) {
        dlog(`  - "${filePath.getFilePath()}"`);

        try {
            await processManifest(filePath); // TODO This doesn't need to always happen automatically
        } catch (err) {
            console.error(clr.red(`Error processing manifest (${filePath.getFilePath()}): ${err}`));
        }
    }
}

export default startApp;