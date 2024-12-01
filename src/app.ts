import fs from 'node:fs';

import chalk from 'chalk';

import { stylePath } from './utility/string.js';
import { dlog, dlogSectionWithData } from './utility/logging.js';
import { UserConfig } from './type/UserConfig.js';
import { Manifest } from './type/Manifest.js';
import { ShortcutOutput } from './type/Shortcut.js';
import { parseUserConfigData } from './config/config.js';

interface ManifestWriteOperationResults {
    manifestIn: Manifest,
    manifestOut: ShortcutOutput[],
    shortcutStats: {
        totalInFile: number,
        enabled: number,
        disabled: number,
        skipped: number,
        ok: number
    }
}

async function writeManifestOutput(manifest: Manifest) : Promise<ManifestWriteOperationResults> {
    // const invalidShortcuts = [];
    const enabledShortcuts = manifest.getShortcuts().filter(shortcut => shortcut.isEnabled());

    const filePath = manifest.getWritePath();
    const output = enabledShortcuts.map(shortcut => shortcut.getWritableObject());
    const contents = JSON.stringify(output);

    dlogSectionWithData(
        'MANIFEST WRITE OPERATION',
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

function printWriteResults(results: ManifestWriteOperationResults) {
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

        dlogSectionWithData(
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

        dlogSectionWithData(
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
    const pfxOk   = true ? chalk.greenBright.bold(sbCheck) : sbCheck; // TODO withColor check
    const pfxFail = true ? chalk.redBright.bold(sbXmark) : sbXmark;
    const pfxWarn = true ? chalk.yellowBright.bold('!') : '!';

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

    const strOkRatio = true ? chalk.magentaBright(okRatio) : okRatio;
    const strFromSource = `from source ${true ? chalk.cyanBright(name) : name}`;

    let builder = `${wrotePrefix} Wrote `;
    if (nOk > 0) {
        builder += `${strOkRatio} `;
        builder += strFromSource;
    } else {
        builder += `nothing ${strFromSource}`;
    }

    console.log(builder);

    dlog(`  - Source File Path: ${stylePath(manifestIn.getFilePath())}`);
    dlog(`  - Write File Path: ${stylePath(writePath)}`);
}

async function processManifest(manifest: Manifest) {
    // TODO Additionally validate if write path is valid, make folders if missing
    // TODO If it's a file, write to the file, but if it's a folder, write the file inside of the folder, maybe based on the input file's name
    
    const { name, shortcuts } = manifest.data;

    if (!Array.isArray(shortcuts))
        throw new Error(`Manifest (${manifest.getName()} requires a key "shortcuts" which is a list of paths, but the user config is set to a non-array type`);

    if (shortcuts.length === 0)
        console.log(chalk.yellow(`WARN: No top-level shortcuts value found in manifest: ${name}`));

    await writeManifestOutput(manifest)
            .then(results => {
                printWriteResults(results);
            })
            .catch(err => {
                throw new Error(`An error occurred while writing an output manifest (Manifest: ${manifest.getName()}): ${err}`);
            });
}

async function startApp() {
    const userConfig = await parseUserConfigData();
    const { manifests: manifestPaths } = userConfig.search;

    for (const filePath of manifestPaths) {
        dlog(`  - "${filePath.getFilePath()}"`);

        try {
            await processManifest(filePath);
        } catch (err) {
            console.error(chalk.red(`Error processing manifest (${filePath.getFilePath()}): ${err}`));
        }
    }
}

export default startApp;