import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import yaml from 'yaml';

import { clog } from '../utility/console.js';
import { dlog, isDebugActive } from '../utility/debug.js';
import { delimitedList } from '../utility/string.js';
import { boolFmt, checkCross, enabledDisabled } from '../utility/boolean.js';

import { UserConfig } from '../type/UserConfig.js';

import { loadUserConfigData } from './load-config.js';
import ManifestData from '../type/ManifestData.js';
import Manifest from '../type/Manifest.js';
import ConfigData from '../type/ConfigData.js';

const EXAMPLE_CONFIG_FILENAME = 'example.config.yml';
const EXAMPLE_CONFIG_PATH = path.join('config', 'example', EXAMPLE_CONFIG_FILENAME);
const EXAMPLE_CONFIG_URL = `https://raw.githubusercontent.com/tsgrissom/srm-manifest-generator/refs/heads/main${EXAMPLE_CONFIG_PATH}`;

const USER_CONFIG_FILENAME = 'config.yml';
const USER_CONFIG_PATH = path.join('config', USER_CONFIG_FILENAME) // PATH_EXAMPLE_CONFIG;

const clogConfigStatus = (message: string) => clog(`User Config: ${message}`);
const clogConfigWarn = (message: string) => console.warn(chalk.yellow('User Config') + `: ${message}`);
const clogConfigInvalid = (message: string, withReadme: boolean = true) => {
    console.error(chalk.red(`INVALID User Config: ${message}`));
    if (withReadme)
        console.error(chalk.redBright(`See the project README: `) + chalk.redBright.underline('https://github.com/tsgrissom/srm-manifest-generator'))
}

const dlogConfigStatus = (message: string) => { if (isDebugActive()) clogConfigStatus(message) }

// MARK: HELPERS

async function validateManifestPathExists(manPath: string) : Promise<boolean> {
    const manPathName = `(Path: "${manPath}")`;

    try {
        await fs.promises.access(manPath).catch(() => {
            clogConfigWarn(`Manifest file path does not exist ${manPathName}`);
            return false;
        });

        dlog(`Manifest file path exists ${manPathName}`);
    } catch (err) {
        throw new Error(`Error while validating manifest path existence (Path: ${manPath}): ${err}`);
    }

    return true;
}

async function validateManifestPathIsSupportedFilesystemType(manPath: string, config: ConfigData) : Promise<boolean> {
    const manPathName = `(Path: "${manPath}")`;

    try {
        const stats = await fs.promises.stat(manPath);

        if (!stats.isFile() && !stats.isDirectory())
            clogConfigWarn(`Unsupported filesystem type (Supported: File or Folder) was set as a manifest path in the user ${USER_CONFIG_FILENAME}.`);

        const { scanDirectories, scanRecursively } = config.search;

        if (stats.isFile()) {
            dlog(`Manpath is a file ${manPathName}`);
            return true;
        } else if (stats.isDirectory()) {
            dlog(`> Manpath is a directory ${manPathName}`);
            dlog(`- Scan Directories? ${enabledDisabled(scanDirectories)}`);
            dlog(`- Scan Recursively? ${enabledDisabled(scanRecursively)}`);

            if (!scanDirectories) {
                clogConfigWarn(`Manifests file path list contains a path pointing to a directory, but scanning directories is disabled by the user's ${USER_CONFIG_FILENAME}. The following path will be skipped: ${manPath}`);
                return false;
            }

            return true;
        } else {
            clogConfigWarn(`Unsupported filesystem type at the given path was ignored ${manPathName}`);
        }
    } catch (err) {
        throw new Error(`Could not stat manifest path ${manPath}: ${err}`);
    }
    
    return true;
}

async function readManifestFile(manPath: string) : Promise<object> {
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

async function validateManifestFileContents(manPath: string, object: object) : Promise<ManifestData> {
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

    let shortcutValue;

    for (const [key, value] of Object.entries(object)) {
        if (key === 'name' || key === 'sourceName') {
            keyAliasUsedForName = key;
            data.name = value;
        } else if (key === 'root' || key === 'rootDir' || key === 'rootDirectory' || key === 'directory') {
            keyAliasUsedForRootDir = key;
            data.rootDirectory = value;
        } else if (key === 'output' || key === 'outputPath') {
            keyAliasUsedForOutput = key;
            data.outputPath = value;
        } else if (key === 'shortcuts' || key === 'titles' || key === 'entries') {
            keyAliasUsedForShortcuts = key;
            data.shortcuts = []; // TODO Parse shortcuts sometime after this, requires Manifest instance
            shortcutValue = value;
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
    if (!hasAttrRootDir) 
        throw new Error(`Manifest is missing a root directory attribute ${manPathName}`);
    if (!hasAttrOutput)
        throw new Error(`Manifest is missing an output directory attribute ${manPathName}`);

    if (hasAttrShortcuts) {
        // TODO Load shortcuts

        dlog(chalk.magenta('LOADING SOME SHORTCUTS FROM MANIFEST'));
    }

    return data;
}

async function makeManifestsArray(manPaths: string[], config: ConfigData) : Promise<Manifest[]> {
    dlog('Creating Array of Manifest Instances', true);
    
    const okManifests: Manifest[] = [];

    if (manPaths.length === 0) {
        clogConfigStatus('Manifest paths list was empty. No manifests will be loaded or processed.');
        return okManifests;
    }

    for (const [index, manPath] of manPaths.entries()) {
        const manPathName = `(Path: "${manPath}")`;
        dlog(`Manifest Instance #${index} > Starting processing of manpath ${manPathName}`, true);

        const exists = await validateManifestPathExists(manPath);
        const validFsType = await validateManifestPathIsSupportedFilesystemType(manPath, config);
        
        dlog(`Manpath exists? ${checkCross(exists)} (${manPath})`);
        dlog(`Manpath is a valid fs type? ${checkCross(validFsType)} ${manPathName}`);

        if (!exists) {
            clog(`Skipping manifest (Path: ${manPath})`);
            continue;
        }

        const object = await readManifestFile(manPath);
        const data = await validateManifestFileContents(manPath, object);        
        const instance = new Manifest(manPath, data);

        okManifests.push(instance);

        dlog(`Manifest Instance #${index} > Completed processing of manpath ${manPathName}`, true);
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

    const keyAliases: Record<string, string> = {
        directories: 'scanDirectories',
        recursively: 'scanRecursively',
        sources: 'manifests'
    }

    const resolveAlias = (key: string): string => {
        return keyAliases[key] || key;
    }

    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveAlias(key);

        switch (resolved) {
            case 'scanDirectories': {
                if (typeof value === 'boolean') {
                    // TEST Make sure values still changing when using resolved as switch
                    userConfig.search.scanDirectories = value;
                    // dlogConfigStatus(`search.scanDirectories set=${boolFmt(value)}`); 
                    dlogConfigStatus(chalk.magenta(`search.scanDirectories set=${boolFmt(value)}`));
                } else {
                    clogConfigInvalid(`Value of search.scanDirectories must be a boolean but was not: ${value}`);
                }
                break;
            }
            case 'scanRecursively': {
                if (typeof value === 'boolean') {
                    userConfig.search.scanRecursively = value;
                    // dlogConfigStatus(`search.scanRecursively set=${boolFmt(value)}`);
                    dlogConfigStatus(chalk.magenta(`search.scanRecursively set=${boolFmt(value)}`));
                } else {
                    clogConfigInvalid(`Value of search.scanRecursively must be a boolean but was not: ${value}`);
                }
                break;
            }
            case `manifests`: {
                if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
                    const okManifests = await makeManifestsArray(value, userConfig);

                    userConfig.search.manifests = okManifests;
                    // dlogConfigStatus(`search.manifests set=${delimitedList(value)}`);
                    dlogConfigStatus(chalk.magenta(`search.manifests set=${delimitedList(value)}`));
                    
                    if (okManifests.length === 0) {
                        clog(chalk.yellow(`No manifest paths were loaded from the ${USER_CONFIG_FILENAME}`));
                    } else if (okManifests.length > 0) {
                        clog(chalk.blue(`${okManifests.length} manifests were loaded from the ${USER_CONFIG_FILENAME}`));
                    } 
                } else {
                    if (!Array.isArray(value)) {
                        clogConfigInvalid('Value of search.manifests must be array of strings but was not an array');
                    } else {
                        clogConfigInvalid('All entries of search.manifests must be a string but at least one was not');
                    }
                }
                break;
            }
            default: {
                const unknownKey = `"search.${value}"`;
                clogConfigWarn(`Unknown ${USER_CONFIG_FILENAME} key was set at ${unknownKey}`);
            }
        }
    }



    return userConfig;
}

//     const nOk = okManifests.length,
//           nAllPaths = allManifests.length;
    
//     let ctOk = `${nOk}/${nAllPaths}`;

//     if (nOk === nAllPaths) {
//         ctOk = chalk.green(ctOk);
//     } else if (nOk < nAllPaths) {
//         ctOk = chalk.red(ctOk);
//     }

//     logConfigStatus(`Loaded ${ctOk} configured manifest paths`);

//     dlogSectionWithData(
//         'User Config: Search section finished loading',
//         `Scan Directories? ${enabledDisabled(scanDirectories)}`,
//         `Scan Recursively? ${enabledDisabled(scanRecursively)}`,
//         chalk.blueBright('Manifest Paths')
//     );

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
    // TODO Process other sections

    return userConfig;
}

export {
    EXAMPLE_CONFIG_FILENAME, EXAMPLE_CONFIG_PATH, EXAMPLE_CONFIG_URL,
    USER_CONFIG_FILENAME, USER_CONFIG_PATH,
    parseUserConfigData
}