import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import YAML from 'yaml';

import { PATH_USER_CONFIG, loadUserConfigData } from './load-config.js';
import Manifest from './Manifest.js';

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

function verifyManifestPath(filePath, shouldScanDirectories) {
    try {
        const fileExists = fs.existsSync(filePath);
        if (!fileExists) {
            logConfigWarn(`Manifest path from config.yml does not exist: ${filePath}`);
            return false;
        }
    } catch (err) {
        console.error(`Something went wrong while checking if path exists`);
        console.error(`Path: ${filePath}`);
        console.error(`Error: `, err);
    }

    try {
        const stats = fs.statSync(filePath);

        if (stats.isFile()) { // Files are always accepted
            // TODO: Debug msg
            // TODO: Make sure it's a supported filetype
            return true;
        } else if (stats.isDirectory()) { // Directories are accepted if enabled in config.yml, default true
            // TODO: Debug msg
            // console.log(chalk.blue(`DEBUG:\nIs a folder: ${filePath}\nShould scan directories: ${shouldScanDirectories}\nShould scan recursively: ${shouldScanRecursively}`));
            
            if (!shouldScanDirectories) {
                logConfigWarn(`Config option "manifests" contains a path which points to a directory, but Scanning Directories is disabled by the config.yml. Skipping the following manifest path: "${filePath}"`);
                return false;
            }

            return true;
        } else {
            logConfigWarn(`Unsupported filesystem type (supported types: file or folder) was passed as a manifest file path and will be ignored: ${filePath}`);
        }
    } catch (err) {
        console.error('Something went wrong while checking if stats of manifest file path');
        console.error(`Path: ${filePath}`);
        console.error(`Error: `, err);
    }

    return true;
}

async function createManifestInstance(filePath, fallbackFileName) {
    // TODO Check args

    const contents = await fs.promises.readFile(filePath);
    const object = YAML.parse(contents);
    const instance = new Manifest(fallbackFileName, object);

    return instance;
}

// LOAD, PARSE, AND EXPORT USER CONFIG

let userConfigData;
const userConfig = {
    search: {},
    output: {},
    validation: {},
    logging: {}
};

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

// Process section: "search"
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
    
    const shouldScanDirectories = section['scan-directories'] ?? true;
    const shouldScanRecursively = section.recursive || false;
    // TODO: Implement options

    // const okManifestPaths = manifestPaths.filter(filePath => verifyManifestPath(filePath, shouldScanDirectories));
    // const okManifests = allManifestPaths
    //     .filter(mp => verifyManifestPath(mp, shouldScanDirectories))
    //     .map(mp => {
    //         return new Manifest(mp);
    //     });

    const okManifests = allManifestPaths
        .filter(filePath => verifyManifestPath(filePath, shouldScanDirectories))
        .map(async filePath => {
            const fileName = path.basename(filePath);
            const instance = await createManifestInstance(filePath, fileName);
            return instance;
        });

    userConfig.search.scanDirectories = shouldScanDirectories;
    userConfig.search.recursive = shouldScanRecursively;
    userConfig.search.manifests = okManifests;

    logConfigStatus(`Loaded ${okManifests.length}/${allManifestPaths.length} configured manifest paths`);
}

// Process section: "output"

// Process section: "validation"

// Process section: "logging"

export default userConfig;