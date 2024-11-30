import fs from 'node:fs';

import chalk from 'chalk';
import yaml from 'yaml';

import { PATH_USER_CONFIG, loadDataFromUserConfig as loadUserConfigData } from './load-config.js';
import Manifest from './Manifest.js';
import { logDebugHeader, logDebugPlain, logDebugSectionWithData } from './utilities.js';
import { enabledDisabled } from './string-utilities.js';

// MARK: HELPERS

function logConfigErrorAndExit(message, displayReadme = true) {
    console.error(chalk.red(`INVALID User Config: ${message}`));
    if (displayReadme) {
        console.log(chalk.red('See the project README: ') + chalk.red.underline('https://github.com/tsgrissom/srm-manifest-generator'));
    }
    process.exit();
}

function logConfigWarn(message, withColor = true) {
    let text = `WARN User Config: ${message}`;
    text = withColor ? chalk.yellow(text) : text;
    console.warn(text);
}

function logConfigStatus(message) {
    console.log(`User Config: ${message}`);
}

async function verifyManifestPath(filePath, scanDirectories, scanRecursively) {
    logDebugHeader('Verifying Manifest Path');

    try {
        await fs.promises.access(filePath).catch(() => {
            logConfigWarn(` > Given manifest file path does not exist: ${filePath}`);
            return false;
        });

        logDebugPlain(` > Given manifest file path exists: ${filePath}`);
    } catch (err) {
        throw new Error(`Error while checking if manifest path exists (Path: ${filePath}):`, err);
    }

    try {
        const stats = await fs.promises.stat(filePath);

        if (!stats.isFile() && !stats.isDirectory()) {
            logConfigWarn(`Unsupported filesystem type (Supported: File or Folder) was set as a manifest file path in the user config.yml.`);
        }

        if (stats.isFile()) { // Files are always accepted
            logDebugPlain(` > Manifest path is a file: ${filePath}`);
            // TODO: Make sure it's a supported filetype
            return true;
        } else if (stats.isDirectory()) { // Directories are accepted if enabled in config.yml, default true
            logDebugPlain(` > Manifest path is a directory: ${filePath}`);
            logDebugPlain(` > Scan Directories? ${enabledDisabled(scanDirectories)}`);
            logDebugPlain(` > Scan Recursively? ${enabledDisabled(scanRecursively)}`);
            
            if (!scanDirectories) {
                logConfigWarn(`Config option "manifests" contains a path which points to a directory, but Scanning Directories is disabled by the config.yml. Skipping the following manifest path: "${filePath}"`);
                return false;
            }

            return true;
        } else {
            logConfigWarn(`Unsupported type at the given path was ignored: ${filePath}`);
        }
    } catch (err) {
        throw new Error(`Error while checking stat of manifest path (Path: ${filePath}):`, err);
    }

    return true;
}

/**
 * Creates an instance of the Manifest class based on a `filePath`, with a fallback `fileName` as required by the constructor of Manifest.
 * @param {string} filePath The path of the manifest file from which to create a Manifest instance.
 * @returns {Manifest} The Manifest instance created from the given `filePath`.
 */
async function createManifestInstance(filePath) {
    // TODO Rewrite jsdoc to reflect removed fileName param

    if (!filePath)
        throw new Error(`Unable to create Manifest instance from invalid constructor arg filePath: "${filePath}"`);
    if (filePath.trim() === '')
        throw new Error(`Unable to create Manifest instance from empty constructor arg: filePath: "${filePath}"`);

    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const object = yaml.parse(data);
        const manifest = new Manifest(filePath, object);
        
        return manifest;
    } catch (err) {
        throw new Error(`Error reading or parsing file: ${err.message}`);
    }
}

// MARK: LOAD CONFIG

const userConfig = {
    search: {},
    output: {},
    validation: {},
    logging: {}
};
let userConfigData;

try {
    userConfigData = await loadUserConfigData();
} catch (error) {
    console.error(chalk.red('An error occurred while loading the user config data:', error));
}

if (!userConfigData) {
    if (!fs.existsSync(PATH_USER_CONFIG)) {
        logConfigErrorAndExit('You must create a config.yml to use SRM Manifest Generator');
    } else {
        logConfigErrorAndExit('Your config.yml cannot be empty. Visit the link below to view required configuration options.');
    }
}

// MARK: Search Section
{
    const section = userConfigData.search;

    if (section === null) {
        logConfigErrorAndExit('Your config.yml "search" section cannot be empty');
    }
    if (!section) {
        logConfigErrorAndExit('Your config.yml is missing the required section "search"');
    }

    const { manifests: allManifestPaths } = section;

    if (!allManifestPaths) {
        logConfigErrorAndExit('Your config.yml is missing the required list of paths "manifests" within the section "search"');
    }
    
    const scanDirectories = section.scanDirectories ?? true;
    const scanRecursively = section.recursive || false;

    // TODO: Implement options

    const okManifests = [];

    for (const filePath of allManifestPaths) {
        try {
            const isValid = await verifyManifestPath(filePath, scanDirectories, scanRecursively);
            if (!isValid)
                continue;
            const instance = await createManifestInstance(filePath);
            okManifests.push(instance);
        } catch (err) {
            console.error(`Error processing manifest at ${filePath}:`, err);
        }
    }

    userConfig.search.scanDirectories = scanDirectories;
    userConfig.search.recursive = scanRecursively; // TODO Update to scanRecursively
    userConfig.search.manifests = okManifests;

    const nOk = okManifests.length,
          nAllPaths = allManifestPaths.length;
    
    let ctOk = `${nOk}/${nAllPaths}`;

    if (nOk === nAllPaths) {
        ctOk = chalk.green(ctOk);
    } else if (nOk < nAllPaths) {
        ctOk = chalk.red(ctOk);
    }

    logConfigStatus(`Loaded ${ctOk} configured manifest paths`);

    logDebugSectionWithData(
        'User Config: Search section finished loading',
        `Scan Directories? ${enabledDisabled(scanDirectories)}`,
        `Scan Recursively? ${enabledDisabled(scanRecursively)}`,
        chalk.blueBright('Manifest Paths')
    );
}

// MARK: Output Section

// MARK: Validation Section

// MARK: Logging Section

export default userConfig;