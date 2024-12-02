import fs from 'node:fs';

import clr from 'chalk';

import { clog } from './utility/console.js';
import { dlog, dlogDataSection } from './utility/debug.js';
import { validatePath, stylePath } from './utility/path.js';

import Manifest from './type/manifest/Manifest.js';
import ManifestWriteOperationResults from './type/manifest/ManifestWriteResults.js';

import { parseUserConfigData } from './config/config.js';

async function writeManifestOutput(manifest: Manifest) : Promise<ManifestWriteOperationResults> {
    // const invalidShortcuts = [];
    const enabledShortcuts = manifest.getShortcuts().filter(shortcut => shortcut.isEnabled());

    const filePath = manifest.getWritePath();
    const output = enabledShortcuts.map(shortcut => shortcut.getWritableObject());
    const contents = JSON.stringify(output);

    dlogDataSection(
        clr.bgCyanBright('MANIFEST WRITE OPERATION'),
        '- ',
        `filePath: ${filePath}`,
        `enabled len: ${enabledShortcuts.length}`,
        `output: ${output}`,
        `output len: ${output.length}`,
        `contents: ${contents}`
    );

    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, contents, 'utf-8', err => {
            if (err) {
                reject(err);
            } else {
                const nTotal = manifest.getShortcuts().length,
                      nEnabled = enabledShortcuts.length;

                const results: ManifestWriteOperationResults = {
                    manifestIn: manifest,
                    manifestOut: output,
                    shortcutStats: {
                        totalInFile: nTotal,
                        enabled: nEnabled,
                        disabled: nTotal - nEnabled,
                        // invalid: nInvalid // TODO
                        // skipped: nInvalid + nDisabled // TODO
                        skipped: nTotal - nEnabled,
                        ok: output.length
                    }
                };

                resolve(results);
            }
        });
    });
}

async function printWriteResults(results: ManifestWriteOperationResults) {
    const { manifestIn, shortcutStats } = results;

    const name = manifestIn.getName(),
          writePath = manifestIn.getWritePath();

    const nTotal = shortcutStats.totalInFile,
          nEnabled = shortcutStats.enabled,
          nDisabled = shortcutStats.disabled,
          nSkipped = shortcutStats.skipped,
          nOk = shortcutStats.ok;

    let okRatio = `${nOk}/${nTotal} shortcuts`;

    if (nTotal !== 1)
        okRatio += 's';
    
    // Debug info
    {
        let header = `Wrote ${okRatio} from source "${name}"`;
        if (nOk > 1)
            header += ` to file ${writePath}`;

        dlogDataSection(
            header,
            `Name: "${name}"`,
            `Input File Path: ${stylePath(manifestIn.filePath)}`,
            `Name From: ${manifestIn.getNameSource()}`,
            `Value of Name Attribute: "${manifestIn.data.name}"`,
            // `Fallback Name: "${manifestIn.}"`,
            `Output Path: ${stylePath(manifestIn.getOutputPath())}`,
            `Write File Path: ${stylePath(manifestIn.getWritePath())}`,
            `Root Directory: ${stylePath(manifestIn.data.rootDirectory)}` // TODO Display validation here for paths
        );

        dlogDataSection(
            'Number of Shortcuts',
            `Total in File: ${nTotal}`,
            `Written: ${nOk}`,
            `Enabled: ${nEnabled}`,
            `Disabled: ${nDisabled}`,
            `Skipped: ${nSkipped}`
        );
    }

    const sbCheck = '\u2713 ';
    const sbXmark = '\u2715 ';
    const pfxOk   = true ? clr.greenBright.bold(sbCheck) : sbCheck; // TODO withColor check
    const pfxFail = true ? clr.redBright.bold(sbXmark) : sbXmark;
    const pfxWarn = true ? clr.yellowBright.bold('!') : '!';

    let wrotePrefix;

    if (nOk > 0) { // At least one shortcut was ok
        if (nOk === nTotal) { // 100% success
            wrotePrefix = pfxOk;
        } else { // Success between 0-100%
            if (nOk === (nTotal - nDisabled)) {
                wrotePrefix = pfxOk;
            } else { // TEST This condition
                wrotePrefix = pfxWarn;
            }
        }
    } else { // All shortcuts might have failed
        if (nOk === nTotal) { // Success because there were no shortcuts
            wrotePrefix = pfxOk;
        } else { // All shortcuts have failed
            wrotePrefix = pfxFail;
        }
    }

    // TODO This all needs withColor

    const strOkRatio = true ? clr.magentaBright(okRatio) : okRatio;
    const strFromSource = `from source ${true ? clr.cyanBright(name) : name}`;

    let builder = `${wrotePrefix} Wrote `;
    if (nOk > 0) {
        builder += `${strOkRatio} `;
        builder += strFromSource;
    } else {
        builder += `nothing ${strFromSource}`;
    }

    clog(builder);

    const styledSourcePath = await validatePath(manifestIn.getFilePath());
    const styledWritePath = await validatePath(writePath);
        
    dlog(`  - Source File Path: ${styledSourcePath}`);
    dlog(`  - Write File Path: ${styledWritePath}`);
}

async function processManifest(manifest: Manifest) {
    // TODO Additionally validate if write path is valid, make folders if missing
    // TODO If it's a file, write to the file, but if it's a folder, write the file inside of the folder, maybe based on the input file's name
    
    const { name, shortcuts } = manifest.data;
    const manPath = manifest.filePath;

    if (!Array.isArray(shortcuts))
        throw new Error(`Manifest (${manifest.getName()} requires a key "shortcuts" which is a list of paths, but the user config is set to a non-array type`);

    if (shortcuts.length === 0)
        clog(clr.yellow(`WARN: No top-level shortcuts value found in manifest: ${name}`));

    try {
        const writeResults = await writeManifestOutput(manifest);
        clog(clr.green(`Manifest output has been written to ${manPath}`));
        await printWriteResults(writeResults);
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
            await processManifest(filePath);
        } catch (err) {
            console.error(clr.red(`Error processing manifest (${filePath.getFilePath()}): ${err}`));
        }
    }
}

export default startApp;