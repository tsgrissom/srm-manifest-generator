import fs from 'node:fs';

import chalk from 'chalk';
import yaml from 'yaml';

import { getCountString, getFormattedBoolean, logDebug } from './utilities.js';
import userConfig from './config.js';
import path from 'node:path';
import Manifest from './Manifest.js';
import Shortcut from './Shortcut.js';

const isDebugging = process.argv.includes('--debug'); // TODO: Replace with better CLI

async function readInputManifest(inputFile) {
    // TODO: Validate file is a yml
    try {
        const data = await fs.promises.readFile(inputFile, 'utf8');
        const json = yaml.parse(data);
        // TODO: Validate JSON data received from input manifest
        return json;
    } catch (err) {
        console.error(`Failed to read input manifest file at ${inputFile}`, err);
    }
}

async function pathExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// TODO Move to utils
const isPathMissingFileExtension = (filePath) => {
    const extension = path.extname(filePath);
    return !extension;
}

const doesPathHaveJsonFileExtension = (filePath) => {
    const extension = path.extname(filePath);
    return extension === '.json' || extension === '.jsonc'; // TODO Make valid JSON extensions configurable
}

/**
 * Calculates a write path for a JSON file given file name and a path. If the path is an existing file and/or
 * has a JSON file extension, returns the given path. Otherwise, the function returns the path joined to
 * the file name.
 * @param {*} fileName The file name which is expected to be written, either on top of or within the filePath
 * @param {*} inpPath The fs path to determine if the file name should be written on top of or within
 */
async function calculateOutputWritePathFromInputPath(fileName, inpPath) {
    if (!fileName) {
        throw new Error('Unable to determine write path for given file name:', fileName);
    }
    if (doesPathHaveJsonFileExtension(fileName)) {
        // TODO Point to config if needing custom json file extension recognized
        throw new Error('Cannot calculate JSON file path for non-JSON file:', fileName);
    }

    if (!inpPath) {
        throw new Error('Unable to determine write path for given path:', path);
    }
    // if (inpPath.endsWith('.json') || inpPath.endsWith('.jsonc')) {
 
    // }

    // TODO Revisit this and figure out how to calculate either the inner path or the given path
    return inpPath;
}

async function writeOutputManifest(manifest) {
    // TODO Replace the bulk of this code with methods from Manifest
    // TODO Additionally validate if write path is valid, make folders if missing
    // TODO If it's a file, write to the file, but if it's a folder, write the file inside of the folder, maybe based on the input file's name

    const inputFilePath = manifest.fileName;
    const inputFileBasename = await manifest.getNameOfFile();
    const outputPath = await manifest.getOutputPath();
    const writePath = await manifest.getWritePath();
    const rootDir = await manifest.getRootDirectory();
    const shortcuts = await manifest.getShortcuts(); // Top-level shortcuts in the manifest document, key "shortcuts"

    if (!outputPath) { // TODO Test this
        const t = `Unable to write manifest file without specifying an output path: ${inputFilePath}`;
        const tc = true ? chalk.red(t) : t; // TODO withColor
        const t2 = 'Ensure your manifest file has a top-level property named "output"';
        const tc2 = true ? chalk.red(t2) : t2; // TODO withColor
        
        console.error(tc);
        console.error(tc2);
        return;
    }

    const inputName = `"${inputFilePath}"`;
    const outputName = `"${outputPath}"`;
    const writePathName = `"${writePath}`;
    
    if (Array.isArray(shortcuts)) {
        if (shortcuts.length === 0) {
            console.log(chalk.yellow(`WARN: No top-level shortcuts value found in manifest: ${inputName}`));
        }
    } else {
        console.error(chalk.red(`ERROR: Manifest ${inputName} has a non-array shortcuts key when shortcuts must be a array`));
    }

    // TODO Any preprocessing needed for raw top-level shortcuts?

    // TODO All of this loading should be done inside Manifest constructor

    const invalidShortcuts = [];
    const enabledShortcuts = await manifest.getEnabledShortcuts();
    const newShortcuts = enabledShortcuts.map(json => {
        const shortcut = new Shortcut(rootDir, json);
        const title = shortcut.getTitle();
        const relTarget = shortcut.getRelativeTargetPath();
        const fullPath = path.join(rootDir, relTarget);

        const obj = {
            title: title,
            target: fullPath
        };

        return obj;
    });

    const nTotal    = shortcuts.length,
          nEnabled  = enabledShortcuts.length,
          nInvalid  = invalidShortcuts.length,
          nDisabled = nTotal - nEnabled,
          nSkipped  = nInvalid + nDisabled,
          nOk       = newShortcuts.length;

    let ctRatioOkToTotal = `${nOk}/${nTotal} shortcut`;
    if (nTotal !== 1) {
        ctRatioOkToTotal += 's';
    }
    const ctOk = getCountString(nOk, 'shortcut');
    
    if (isDebugging) {
        let header = `Transformed ${ctRatioOkToTotal} from source "${inputFileBasename}"`;

        if (nOk > 1) {
            header += ` to output ${writePathName}`;
        }

        const headerC = true ? chalk.cyan(header) : header; // TODO withColor
        const subheader = 'SHORTCUTS BY THE NUMBERS:';
        const subheaderC = true ? chalk.yellow(subheader) : subheader; // TODO withColor

        console.log(headerC); // TODO withColor
        console.log(` * Source File: ${inputFilePath}`);
        console.log(` * Output Path: ${outputPath}`);
        console.log(` * Output File: ${outputPath}`);
        console.log(` * Source Name: ${inputFileBasename}`);
        console.log(` * Root Directory: ${rootDir}`);
        console.log(subheaderC); // TODO withColor
        console.log(` - Total Shortcuts in File: ${nTotal}`);
        console.log(` - Enabled/Disabled: ${nEnabled}/${nDisabled}`);
        console.log(` - Skipped: ${nSkipped}`);
        console.log(` - Written/Total: ${nOk}/${nTotal}`);
        console.log('');
    }

    const sbCheck = '\u2713 ';
    const sbXmark = '\u2715';
    const pfxOk   = true ? chalk.greenBright.bold(sbCheck) : sbCheck; // TODO withColor check
    const pfxFail = true ? chalk.redBright.bold(sbXmark) : sbXmark;
    const pfxWarn = true ? chalk.yellowBright.bold('!') : '!';

    const writeStr = JSON.stringify(newShortcuts, null, 2);

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
            const strFromSource = `from source ${true ? chalk.cyanBright(inputFileBasename) : inputFileBasename}`;

            let strBuilder = `${wrotePrefix} Wrote `;
            if (nOk > 0) {
                strBuilder += `${strCtRatioOkToTotal} `;
                strBuilder += strFromSource;
            } else {
                strBuilder += `nothing ${strFromSource}`;
            }

            console.log(strBuilder);
            
            if (isDebugging) {
                console.log(`  - Input File: ${inputName}`);
                console.log(`  - Output File: ${outputName}`);
            }
        }
    });
}

function startApp() {
    const { manifests, scanDirectories, recursive } = userConfig.search;

    logDebug('User Config');
    logDebug(` - Should Scan Directories: ${getFormattedBoolean(scanDirectories)}`, false);
    logDebug(` - Should Scan Recursively: ${getFormattedBoolean(recursive)}`, false);
    logDebug(`   Manifest Paths:`, false);

    manifests.forEach(manifest => {
        logDebug(`  - "${manifest.filePath}"`);
        writeOutputManifest(manifest);
    });
}

export default startApp;