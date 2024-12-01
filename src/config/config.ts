import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import yaml from 'yaml';

import { dlog, isDebugging } from '../utility/logging.js';
import { delimitedList } from '../utility/string.js';
import { boolFmt, BoolFmtPreset, checkCross, enabledDisabled } from '../utility/boolean.js';

import { ConfigData } from '../type/ConfigData.js';
import { UserConfig } from '../type/UserConfig.js';
import { Manifest, ManifestData } from '../type/Manifest.js';

import { loadUserConfigData } from './load-config.js';
import { Shortcut } from '../type/Shortcut.js';

const EXAMPLE_CONFIG_FILENAME = 'example.config.yml';
const EXAMPLE_CONFIG_PATH = path.join('config', 'example', EXAMPLE_CONFIG_FILENAME);
const EXAMPLE_CONFIG_URL = `https://raw.githubusercontent.com/tsgrissom/srm-manifest-generator/refs/heads/main${EXAMPLE_CONFIG_PATH}`;

const USER_CONFIG_FILENAME = 'config.yml';
const USER_CONFIG_PATH = path.join('config', USER_CONFIG_FILENAME) // PATH_EXAMPLE_CONFIG;

const logConfigStatus = (message: string) => console.log(`User Config: ${message}`);
const dlogConfigStatus = (message: string) => { if (isDebugging()) logConfigStatus(message) }
const logConfigWarn = (message: string) => console.warn(chalk.yellow('User Config') + `: ${message}`);
const logConfigInvalid = (message: string, withReadme: boolean = true) => {
    console.error(chalk.red(`INVALID User Config: ${message}`));
    if (withReadme)
        console.error(chalk.redBright(`See the project README: `) + chalk.redBright.underline('https://github.com/tsgrissom/srm-manifest-generator'))
}

// MARK: HELPERS

async function validateManifestPath(manPath: string, config: ConfigData) : Promise<boolean> {
    dlog(`Validate Manpath > Starting ${manPath}`);

    // TODO Maybe split these two checks up?
    try {
        await fs.promises.access(manPath).catch(() => {
            logConfigWarn(` > Given manifest file path does not exist: ${manPath}`);
            return false;
        });

        dlog(` > Given manifest file path exists: ${manPath}`);
    } catch (err) {
        throw new Error(`Error while checking if manifest path exists (Path: ${manPath}): ${err}`);
    }

    try {
        const stats = await fs.promises.stat(manPath);

        if (!stats.isFile() && !stats.isDirectory()) {
            logConfigWarn(`Unsupported filesystem type (Supported: File or Folder) was set as a manifest file path in the user config.yml.`);
        }

        const { scanDirectories, scanRecursively } = config.search;

        if (stats.isFile()) { // Files are always accepted
            dlog(` > Manifest path is a file: ${manPath}`);
            // TODO: Make sure it's a supported filetype
            return true;
        } else if (stats.isDirectory()) { // Directories are accepted if enabled in config.yml, default true
            dlog(` > Manifest path is a directory: ${manPath}`);
            dlog(` > Scan Directories? ${enabledDisabled(scanDirectories)}`);
            dlog(` > Scan Recursively? ${enabledDisabled(scanRecursively)}`);
            
            if (!scanDirectories) {
                logConfigWarn(`Config option "manifests" contains a path which points to a directory, but Scanning Directories is disabled by the config.yml. Skipping the following manifest path: "${manPath}"`);
                return false;
            }

            return true;
        } else {
            logConfigWarn(`Unsupported type at the given path was ignored: ${manPath}`);
        }
    } catch (err) {
        throw new Error(`Could not stat manifest path (Path: ${manPath}): ${err}`);
    }

    
    return true;
}

async function readManifestFile(manPath: string, config: ConfigData) : Promise<Buffer<ArrayBufferLike>> {
    dlog(`Reading Manfile > Starting ${manPath}`);

    if (!manPath)
        throw new Error(`Required arg manPath was invalid: ${manPath}`);
    if (manPath.trim() === '')
        throw new Error(`Required arg manPath cannot be empty: ${manPath}`);

    try {
        const contents = await fs.promises.readFile(manPath, 'utf-8');
        const object = yaml.parse(contents);
        dlog(`Reading Manfile > Finished ${manPath}`);
        return object;
    } catch (err) {
        throw new Error(`Unable to read manifest file at manpath (Manpath: ${manPath}): ${err}`);
    }
}

async function validateManifestFileContents(manPath: string, object: object, config: ConfigData) : Promise<ManifestData> {
    const keys = Object.keys(object);
    const manPathName = `(Path: ${manPath})`;

    const data: ManifestData = {
        name: '',
        rootDirectory: '',
        outputPath: '',
        shortcuts: []
    }

    let keyAliasUsedForName = '',
        keyAliasUsedForRootDir = '',
        keyAliasUsedForOutput = '',
        keyAliasUsedForShortcuts = '';

    for (const [key, value] of Object.entries(object)) {
        if (key === 'name' || key === 'sourceName') {
            keyAliasUsedForName = key;
            data.name = value;
        } else if (key === 'root' || key === 'rootDirectory') {
            keyAliasUsedForRootDir = key;
            data.rootDirectory = value;
        } else if (key === 'output' || key === 'outputPath') {
            keyAliasUsedForOutput = key;
            data.outputPath = value;
        } else if (key === 'shortcuts' || key === 'titles' || key === 'entries') {
            keyAliasUsedForShortcuts = key;
            data.shortcuts = []; // TODO Parse shortcuts sometime after this, requires Manifest instance
        }
    }

    const hasAttrName = keyAliasUsedForName !== '',
          hasAttrRootDir = keyAliasUsedForRootDir !== '',
          hasAttrOutput = keyAliasUsedForOutput !== '',
          hasAttrShortcuts = keyAliasUsedForShortcuts !== '';
    const wasAttrNameAnAlias = keyAliasUsedForName !== '' && keyAliasUsedForName !== 'name',
          wasAttrRootDirAnAlias = keyAliasUsedForName !== '' && keyAliasUsedForName !== 'rootDirectory',
          wasAttrOutputAnAlias = keyAliasUsedForName !== '' && keyAliasUsedForName !== 'outputPath',
          wasAttrShortcutsAnAlias = keyAliasUsedForName !== '' && keyAliasUsedForName !== 'shortcuts';
    
    // Debug prints
    dlog(`> Manpath: ${manPath}`);
    dlog(`- Has Optional Name Attribute? ${checkCross(hasAttrName)}`);
    if (wasAttrNameAnAlias)
        dlog(`  "${keyAliasUsedForName}"`);
    dlog(`- Has Optional Shortcuts Attribute? ${checkCross(hasAttrShortcuts)}`);
    if (wasAttrShortcutsAnAlias)
        dlog(`  "${keyAliasUsedForShortcuts}"`);
    dlog(`- Has Required Root Dir Attribute? ${checkCross(hasAttrRootDir)}`);
    if (wasAttrRootDirAnAlias)
        dlog(`  "${keyAliasUsedForRootDir}"`);
    dlog(`- Has Required Output Attribute? ${checkCross(hasAttrOutput)}`);
    if (wasAttrOutputAnAlias)
        dlog(`  "${keyAliasUsedForOutput}"`);

    // Make sure required attributes are present
    if (hasAttrRootDir) 
        throw new Error(`Manifest is missing a root directory attribute ${manPathName}`);
    if (hasAttrOutput)
        throw new Error(`Manifest is missing an output directory attribute ${manPathName}`);

    return data;
}

async function makeManifestsArray(manPaths: string[], config: ConfigData) : Promise<Manifest[]> {
    dlog('Creating Array of Manifest Instances', true);
    
    let okManifests: Manifest[] = [];

    if (manPaths.length === 0) {
        logConfigStatus('Manifest paths list was empty. No manifests will be loaded or processed.');
        return okManifests;
    }

    for (const [index, manPath] of manPaths.entries()) {
        dlog(`Manifest Instance > Starting manpath #${index}`);

        const exists = await validateManifestPath(manPath, config);
        dlog(`Manpath exists? ${checkCross(exists)} (${manPath})`);
        if (!exists) {
            console.log(`Skipping manifest (Path: ${manPath})`);
            continue;
        }

        const object = await readManifestFile(manPath, config);
        const data = await validateManifestFileContents(manPath, object, config);        
        const instance = new Manifest(manPath, data);

        okManifests.push(instance);

        dlog(`Manifest Instance > Completed manpath #${index}`);
    }
    
    return okManifests;
}

// MARK: SEARCH

async function parseSearchSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('search'))
        throw new Error(chalk.red('User Config is missing required section "search"'));

    const section = (data as Record<string, unknown>)['search'];
    
    if (typeof section !== 'object' || section === null)
        throw new Error(chalk.red('User Config "search" section is not a valid object'));
    if (Array.isArray(section))
        throw new Error(chalk.red('User Config "search" section must be a mapping, not a list (Expected object, Found array)'));

    for (const key of Object.keys(section)) {
        console.log(`Key in search section: ${key}`);
    }

    const keyAliases: Record<string, string> = {
        scanDirectories: 'directories',
        scanRecursively: 'recursively',
        manifests: 'sources'
    }
    const resolveAlias = (key: string): string => {
        return keyAliases[key] || key;
    }

    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveAlias(key);

        switch (key) { // TODO Switch to resolved
            case 'scanDirectories': {
                if (typeof value === 'boolean') {
                    userConfig.search.scanDirectories = value;
                    dlogConfigStatus(`search.scanDirectories set=${boolFmt(value)}`);
                } else {
                    logConfigInvalid(`Value of search.scanDirectories must be a boolean but was not: ${value}`);
                }
                break;
            }
            case 'scanRecursively': {
                if (typeof value === 'boolean') {
                    userConfig.search.scanRecursively = value;
                    dlogConfigStatus(`search.scanRecursively set=${boolFmt(value)}`);
                } else {
                    logConfigInvalid(`Value of search.scanRecursively must be a boolean but was not: ${value}`);
                }
                break;
            }
            case `manifests`: {
                if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
                    const okManifests = await makeManifestsArray(value, userConfig);
                    userConfig.search.manifests = okManifests;
                    dlogConfigStatus(`search.manifests set=${delimitedList(value)}`)
                } else {
                    if (!Array.isArray(value)) {
                        logConfigInvalid('Value of search.manifests must be array of strings but was not an array');
                    } else {
                        logConfigInvalid('All entries of search.manifests must be a string but at least one was not');
                    }
                }
                break;
            }
            default: {
                const unknownKey = `"search.${value}"`;
                logConfigWarn(`Unknown ${USER_CONFIG_FILENAME} key was set at ${unknownKey}`);
            }
        }
    }

    return userConfig;
}

// MARK: PARSE START

async function loadData() : Promise<object> {
    let userConfigData;
    try {
        userConfigData = await loadUserConfigData();
        return userConfigData;
    } catch (err) {
        throw new Error(`Error loading user config data: ${err}`);
    }
}

async function parseUserConfigData() : Promise<ConfigData> {
    const userConfigData = await loadData();

    if (!userConfigData) {
        try {
            await fs.promises.access(USER_CONFIG_PATH);
            throw new Error(`Your ${USER_CONFIG_FILENAME} cannot be empty.`);
        } catch {
            throw new Error(`You must create a ${USER_CONFIG_FILENAME} to use SRM Manifest Generator`)
        }
    }

    if (typeof userConfigData !== 'object' || Array.isArray(userConfigData)) {
        console.error(chalk.red(`
            User Config is malformed: Expected parsed data to be of type object, but was actually an array or other non-object.
            For an example config, please see: ${EXAMPLE_CONFIG_URL}
        `));
        throw new Error(`User ${USER_CONFIG_FILENAME} is invalid`);
    }  

    let userConfig = new UserConfig();

    userConfig = await parseSearchSection(userConfigData, userConfig);

    return userConfig;
}

(async () => {
    console.log(EXAMPLE_CONFIG_PATH);
    await parseUserConfigData();
})();

export {
    EXAMPLE_CONFIG_FILENAME, EXAMPLE_CONFIG_PATH, EXAMPLE_CONFIG_URL,
    USER_CONFIG_FILENAME, USER_CONFIG_PATH,
    parseUserConfigData
}