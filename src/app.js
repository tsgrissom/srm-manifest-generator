import fs from 'node:fs';

import chalk from 'chalk';

import { enabledDisabled, stylePath, yesNo } from './string-utilities.js';
import { logDebug, logDebugLines, logDebugSectionWithData } from './utilities.js';
import userConfig from './config.js';
import Manifest from './Manifest.js';
import Shortcut from './Shortcut.js';

const isDebugging = process.argv.includes('--debug'); // TODO: Replace with better CLI

/**
 * Writes the writable object of a Manifest instance to its output path.
 * @param {Manifest} manifest The Manifest to derive the output manifest's contents from.
 */
async function writeOutputManifest(manifest) {
    // TODO Replace the bulk of this code with methods from Manifest
    // TODO Additionally validate if write path is valid, make folders if missing
    // TODO If it's a file, write to the file, but if it's a folder, write the file inside of the folder, maybe based on the input file's name

    const { name, rootDirectory, outputPath, shortcuts: allShortcuts } = manifest;

    if (!outputPath) { // TODO Test this
        const t = `Unable to write manifest file without specifying an output path: ${manifest.filePath}`;
        const tc = true ? chalk.red(t) : t; // TODO withColor
        const t2 = 'Ensure your manifest file has a top-level property named "output"';
        const tc2 = true ? chalk.red(t2) : t2; // TODO withColor
        
        console.error(tc);
        console.error(tc2);
        return;
    }

    const writePath = manifest.getWritePath();
    
    if (Array.isArray(allShortcuts)) {
        if (allShortcuts.length === 0) {
            console.log(chalk.yellow(`WARN: No top-level shortcuts value found in manifest: ${name}`));
        }
    } else {
        console.error(chalk.red(`ERROR: Manifest ${name} has a non-array shortcuts key when shortcuts must be a array`));
    }

    // TODO Any preprocessing needed for raw top-level shortcuts?

    // TODO All of this loading should be done inside Manifest constructor

    const invalidShortcuts = [];
    const enabledShortcuts = manifest.getShortcuts().filter(shortcut => shortcut.isEnabled());
    const writeObjects = enabledShortcuts.map(shortcut => shortcut.getWritableObject());

    const nTotal    = allShortcuts.length,
          nEnabled  = enabledShortcuts.length,
          nInvalid  = invalidShortcuts.length,
          nDisabled = nTotal - nEnabled,
          nSkipped  = nInvalid + nDisabled,
          nOk       = writeObjects.length;

    let ctRatioOkToTotal = `${nOk}/${nTotal} shortcut`;

    if (nTotal !== 1)
        ctRatioOkToTotal += 's';
    
    { // Debug info
        let header = `Transformed ${ctRatioOkToTotal} from source "${name}"`;
        if (nOk > 1)
            header += ` to output ${writePath}`;

    logDebugSectionWithData(
        header,
        `Name: "${name}"`,
        `Input File Path: ${stylePath(manifest.filePath)}`,
        `Name From: ${manifest.getNameSource()}`,
        `Value of Name Attribute: "${manifest.getName()}"`,
        `Fallback Name: "${manifest.getFallbackName()}"`,
        `Output Path: ${stylePath(outputPath)}`,
        `Write File Path: ${stylePath(writePath)}`,
        `Root Directory: ${stylePath(rootDirectory)}` // TODO Display validation here for paths
    );

    logDebugSectionWithData(
        'Number of Shortcuts',
        `Total in File: ${nTotal}`,
        `Written: ${nOk}`,
        `Enabled: ${nEnabled}`,
        `Disabled: ${nDisabled}`,
        `Skipped: ${nSkipped}`,
        ``
    );
    }

    const sbCheck = '\u2713 ';
    const sbXmark = '\u2715';
    const pfxOk   = true ? chalk.greenBright.bold(sbCheck) : sbCheck; // TODO withColor check
    const pfxFail = true ? chalk.redBright.bold(sbXmark) : sbXmark;
    const pfxWarn = true ? chalk.yellowBright.bold('!') : '!';

    const writeStr = JSON.stringify(writeObjects, null, 2);

    try {
        const data = fs.promises.writeFile(writePath, writeStr)
    } catch (err) {
        throw new Error(`Something went wrong writing manifest file output (${name})`);
    }

    fs.writeFile(writePath, writeStr, (err) => {
        if (err) {
            console.error(chalk.red(`Error writing results to file: "${outputPath}"`));
            console.error(err);
        } else {
            // TODO If wrote

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

            const strCtRatioOkToTotal = true ? chalk.magentaBright(ctRatioOkToTotal) : ctRatioOkToTotal;
            const strFromSource = `from source ${true ? chalk.cyanBright(name) : name}`;

            let strBuilder = `${wrotePrefix} Wrote `;
            if (nOk > 0) {
                strBuilder += `${strCtRatioOkToTotal} `;
                strBuilder += strFromSource;
            } else {
                strBuilder += `nothing ${strFromSource}`;
            }

            // console.log(strBuilder);

            // if (isDebugging) {
            //     console.log(`  - Input File: ${inputName}`);
            //     console.log(`  - Output File: ${outputName}`);
            // }
        }
    });
}

function startApp() {
    const { manifests, scanDirectories, recursive } = userConfig.search;

    logDebugSectionWithData(
        'User Config finished loading',
        `Scan Directories? ${enabledDisabled(scanDirectories)}`,
        `Scan Recursively? ${enabledDisabled(recursive)}`,
        chalk.magentaBright('Manifest Paths')
    );

    manifests.forEach(manifest => {
        logDebug(`  - "${manifest.filePath}"`, false);
        writeOutputManifest(manifest);
    });
}

export default startApp;