import fs from 'node:fs';

import chalk from 'chalk';
import yaml from 'yaml';

import { PATH_USER_CONFIG, loadDataFromUserConfig as loadUserConfigData } from './load-config.js';
import { Manifest } from '../type/Manifest.js';
import { logDebug, logDebugSectionWithData } from '../utility/logging.js';
import { enabledDisabled } from '../utility/string.js';

// MARK: HELPERS

function logConfigErrorAndExit(message: string, displayReadme: boolean = true) {
    console.error(chalk.red(`INVALID User Config: ${message}`));
    if (displayReadme) {
        console.log(chalk.red('See the project README: ') + chalk.red.underline('https://github.com/tsgrissom/srm-manifest-generator'));
    }
    process.exit();
}

function logConfigWarn(message: string, withColor: boolean = true) {
    let text = `WARN User Config: ${message}`;
    text = withColor ? chalk.yellow(text) : text;
    console.warn(text);
}

function logConfigStatus(message: string) {
    console.log(`User Config: ${message}`);
}

async function verifyManifestPath(filePath: string, scanDirectories: boolean, scanRecursively: boolean) {
    logDebug('Verifying Manifest Path', true);

    try {
        await fs.promises.access(filePath).catch(() => {
            logConfigWarn(` > Given manifest file path does not exist: ${filePath}`);
            return false;
        });

        logDebug(` > Given manifest file path exists: ${filePath}`);
    } catch (err) {
        throw new Error(`Error while checking if manifest path exists (Path: ${filePath}): ${err}`);
    }

    try {
        const stats = await fs.promises.stat(filePath);

        if (!stats.isFile() && !stats.isDirectory()) {
            logConfigWarn(`Unsupported filesystem type (Supported: File or Folder) was set as a manifest file path in the user config.yml.`);
        }

        if (stats.isFile()) { // Files are always accepted
            logDebug(` > Manifest path is a file: ${filePath}`);
            // TODO: Make sure it's a supported filetype
            return true;
        } else if (stats.isDirectory()) { // Directories are accepted if enabled in config.yml, default true
            logDebug(` > Manifest path is a directory: ${filePath}`);
            logDebug(` > Scan Directories? ${enabledDisabled(scanDirectories)}`);
            logDebug(` > Scan Recursively? ${enabledDisabled(scanRecursively)}`);
            
            if (!scanDirectories) {
                logConfigWarn(`Config option "manifests" contains a path which points to a directory, but Scanning Directories is disabled by the config.yml. Skipping the following manifest path: "${filePath}"`);
                return false;
            }

            return true;
        } else {
            logConfigWarn(`Unsupported type at the given path was ignored: ${filePath}`);
        }
    } catch (err) {
        throw new Error(`Could not stat manifest path (Path: ${filePath}): ${err}`);
    }

    return true;
}

/**
 * Reads the contents of an manifest.yml file which is expected to be found at `filePath`, then
 * parses those contents into a JavaScript object.
 * @param {string} filePath The file path to find the manifest file at.
 * @returns {object} The YAML document parsed into JSON.
 */
async function readManifestContents(filePath: string) {
    console.log(chalk.magenta('REACHED READ MANIFEST'));

    if (!filePath)
        throw new Error(`Unable to create Manifest instance from invalid constructor arg filePath: "${filePath}"`);
    if (filePath.trim() === '')
        throw new Error(`Unable to create Manifest instance from empty constructor arg filePath: "${filePath}"`);

    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        console.log(chalk.magenta('END OF READ MANIFEST'));
        return data;
    } catch (err) {
        console.log(chalk.magenta('END OF READ MANIFEST'));
        throw new Error(`Error reading or parsing file: ${err}`);
    }
}

async function createManifestInstance(filePath: string, fileContents: string) {
    // TODO Rewrite jsdoc to reflect removed fileName param

    if (!filePath)
        throw new Error(`Unable to create Manifest instance from invalid constructor arg filePath: "${filePath}"`);
    if (filePath.trim() === '')
        throw new Error(`Unable to create Manifest instance from empty constructor arg filePath: "${filePath}"`);

    const object = yaml.parse(fileContents);
    const manifest = new Manifest(filePath, object);
    return manifest;
}

// MARK: LOAD CONFIG

interface UserConfig {
    search: {
        scanDirectories: boolean;
        scanRecursively: boolean;
        manifests: Manifest[];
    },
    output: {
        
    },
    validation: {},
    logging: {}
}

const userConfig: UserConfig = {
    search: {
        scanDirectories: true,
        scanRecursively: false,
        manifests: []
    },
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
            const isPathValid = await verifyManifestPath(filePath, scanDirectories, scanRecursively);
            
            if (!isPathValid) {
                logConfigWarn(`Path is not valid, skipped: ${filePath}`);
                continue;
            }

            const contents = await readManifestContents(filePath);
            const instance = await createManifestInstance(filePath, contents);
            
            okManifests.push(instance);
        } catch (err) {
            console.error(`Error processing manifest at ${filePath}:`, err);
        }
    }

    userConfig.search.scanDirectories = scanDirectories;
    userConfig.search.scanRecursively = scanRecursively; // TODO Update to scanRecursively
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