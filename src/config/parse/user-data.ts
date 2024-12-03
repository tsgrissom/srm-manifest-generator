import fs from 'node:fs';

import clr from 'chalk';
import yaml from 'yaml';

import { clog } from '../../utility/console.js';
import { clogConfInfo, clogConfWarn, USER_CONFIG_FILENAME } from '../config.js';
import { dlog } from '../../utility/debug.js';
import { checkCross, enabledDisabled } from '../../utility/boolean.js';

import ConfigData from '../../type/config/ConfigData.js';
import Manifest from '../../type/manifest/Manifest.js';
import ManifestData from '../../type/manifest/ManifestData.js';

const fmtManPath = (manPath: string) => `(Path: "${clr.underline(manPath)}")`;

async function makeManifests(manPaths: string[], config: ConfigData) : Promise<Manifest[]> {
    dlog(clr.underline('CREATING MAN INSTANCES'));
    
    const okManifests: Manifest[] = [];

    if (manPaths.length === 0) {
        clogConfInfo('Manifest paths list was empty. No manifests will be loaded or processed.');
        return okManifests;
    }

    for (const [index, manPath] of manPaths.entries()) {
        const id = index+1;
        const pathName = fmtManPath(manPath);
        dlog(`Manifest Instance #${id} > Began processing of manpath ${pathName}`, true);

        const exists   = await checkManPathExists(manPath);
        const okFsType = await checkManPathIsSupportedFsType(manPath, config);
        
        dlog(` ${checkCross(exists)} Manpath exists (${manPath})`);
        dlog(` ${checkCross(okFsType)} Manpath is a valid fs type ${pathName}`);

        if (!exists) {
            clog(` > Skipping manifest (Path: ${manPath})`);
            continue;
        }

        const object = await readManifestFile(manPath);
        const data = await validateManifestFileContents(manPath, object);        
        const instance = new Manifest(manPath, data);

        okManifests.push(instance);

        dlog(`Manifest Instance #${id} > Finished processing of manpath ${pathName}`, true);
    }
    
    return okManifests;
}

async function checkManPathExists(filePath: string) : Promise<boolean> {
    const pathName = fmtManPath(filePath);

    try {
        await fs.promises.access(filePath).catch(() => {
            clogConfWarn(`Manifest file path does not exist ${pathName}`);
            return false;
        });

        dlog(`Manifest file path exists ${pathName}`);
    } catch (err) {
        throw new Error(`Error while validating manifest path existence (Path: ${filePath}): ${err}`);
    }

    return true;
}

async function checkManPathIsSupportedFsType(manPath: string, config: ConfigData) : Promise<boolean> {
    const pathName = fmtManPath(manPath);

    try {
        const stats = await fs.promises.stat(manPath);

        if (!stats.isFile() && !stats.isDirectory())
            clogConfWarn(`Unsupported filesystem type (Supported: File or Folder) was set as a manifest path in the user ${USER_CONFIG_FILENAME}.`);

        const { scanDirectories, scanRecursively } = config.search;

        if (stats.isFile()) {
            dlog(`Manpath is a file ${pathName}`);
            return true;
        } else if (stats.isDirectory()) {
            dlog(`> Manpath is a directory ${pathName}`);
            dlog(`- Scan Directories? ${enabledDisabled(scanDirectories)}`);
            dlog(`- Scan Recursively? ${enabledDisabled(scanRecursively)}`);

            if (!scanDirectories) {
                clogConfWarn(`Manifests file path list contains a path pointing to a directory, but scanning directories is disabled by the user's ${USER_CONFIG_FILENAME}. The following path will be skipped: ${manPath}`);
                return false;
            }

            return true;
        } else {
            clogConfWarn(`Unsupported filesystem type at the given path was ignored ${pathName}`);
        }
    } catch (err) {
        throw new Error(`Could not stat manifest path ${manPath}: ${err}`);
    }
    
    return true;
}

async function readManifestFile(manPath: string) : Promise<object> {
    const pathName = fmtManPath(manPath);
    
    dlog(`Reading Manfile > Starting ${manPath}`);

    if (!manPath)
        throw new Error(`Required arg manPath was invalid ${manPath}`);
    if (manPath.trim() === '')
        throw new Error(`Required arg manPath cannot be empty ${manPath}`);

    try {
        const contents = await fs.promises.readFile(manPath, 'utf-8');
        const object = yaml.parse(contents);
        dlog(`Reading Manfile > Finished ${manPath}`);
        return object;
    } catch (err) {
        throw new Error(`Unable to read manifest file at manpath ${pathName}: ${err}`);
    }
}

async function validateManifestFileContents(manPath: string, object: object) : Promise<ManifestData> {
    const pathName = fmtManPath(manPath);
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
    dlog(` ${checkCross(hasAttrName)} Has Optional Name Attribute`);
    if (wasAttrNameAnAlias)
        dlog(` - Alias used: "${keyAliasUsedForName}"`);
    dlog(` ${checkCross(hasAttrShortcuts)} Has Optional Shortcuts Attribute`);
    if (wasAttrShortcutsAnAlias)
        dlog(` - Alias used: "${keyAliasUsedForShortcuts}"`);
    dlog(` ${checkCross(hasAttrRootDir)} Has Required Root Dir Attribute`);
    if (wasAttrRootDirAnAlias)
        dlog(` - Alias used: "${keyAliasUsedForRootDir}"`);
    dlog(` ${checkCross(hasAttrOutput)} Has Required Output Attribute`);
    if (wasAttrOutputAnAlias)
        dlog(` - Alias used: "${keyAliasUsedForOutput}"`);

    // Make sure required attributes are present
    if (!hasAttrRootDir) 
        throw new Error(`Manifest is missing a root directory attribute ${pathName}`);
    if (!hasAttrOutput)
        throw new Error(`Manifest is missing an output directory attribute ${pathName}`);

    const instance = new Manifest(manPath, data);

    if (hasAttrShortcuts) {
        // TODO Load shortcuts

        dlog(clr.magenta(`LOADING SOME SHORTCUTS FROM MANIFEST: ${instance.getName()}`));

    }

    return data;
}

export { makeManifests };