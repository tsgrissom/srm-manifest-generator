import fs from 'node:fs';

import clr from 'chalk';
import yaml from 'yaml';

import { checkCross } from '../../utility/boolean';
import { clogConfigWarn } from '../../utility/config';
import { clog } from '../../utility/console';
import { USER_CONFIG_FILENAME } from '../config';
import { dlog, dlogHeader } from '../../utility/debug';
import { fmtPath, fmtPathAsTag } from '../../utility/path';
import { SB_ERR_LG, SB_ERR_SM, SB_OK_LG, SB_WARN } from '../../utility/symbols';

import ConfigData from '../../type/config/ConfigData';
import Manifest from '../../type/manifest/Manifest';
import ManifestData from '../../type/manifest/ManifestData';
import { quote } from '../../utility/string';
import Shortcut from '../../type/shortcut/Shortcut';
import ShortcutData from '../../type/shortcut/ShortcutData';

async function makeManifests(manPaths: string[], config: ConfigData) : Promise<Manifest[]> {
    dlog(clr.magenta.underline('CREATING MANIFEST INSTANCES'));
    
    const okManifests: Manifest[] = [];

    if (manPaths.length === 0) {
        clog(`${SB_WARN} User ${USER_CONFIG_FILENAME} manifest paths was empty. No manifests will be loaded or processed.`);
        return okManifests;
    }

    for (const [index, manPath] of manPaths.entries()) {
        const id = index+1;
        const pathTag = fmtPathAsTag(manPath);
        dlog(` > MANIFEST #${id}: Began validating manifest file ${pathTag}`);

        const exists   = await validateManifestPathExists(manPath);
        const okFsType = await validateManifestPathIsSupportedFilesystemType(manPath, config);
        
        dlog(` ${checkCross(exists)} Path exists (${manPath})`);
        dlog(` ${checkCross(okFsType)} Path is a supported filesystem type ${pathTag}`);

        if (!exists) {
            clog(` > Skipping manifest (Path: ${manPath})`);
            continue;
        }

        const object = await readManifestFile(manPath);
        const data = await validateManifestFileContents(manPath, object);        
        const instance = new Manifest(manPath, data);

        okManifests.push(instance);

        dlog(` ${SB_OK_LG} MANIFEST #${id}: Finished validation of manifest path ${fmtPathAsTag(pathTag)}`);
    }

    clogLoadedManifests(manPaths, okManifests);
    
    return okManifests;
}

function clogLoadedManifests(manifestPaths: string[], okManifests: Manifest[], ) {
    const nAll = manifestPaths.length;
    const nOk = okManifests.length;
    const ratio = `${nOk}/${nAll}`;

    // TODO Isolate below

    if (nOk <= 0) {
        const postfix = nAll > 0 ? clr.red(ratio) : '';
        clog(`${SB_ERR_LG} No manifest paths were loaded from the ${USER_CONFIG_FILENAME} ${postfix}`);
        // TODO Debug log here
        return;
    }

    let prefix = '',
        blob = '',
        postfix = '';
    if (nAll === nOk) {
        if (nAll > 0) {
            prefix = SB_OK_LG;
            blob = 'All configured manifest paths were loaded';
            postfix = clr.greenBright(ratio);
        } else if (nAll === 0) {
            prefix = SB_ERR_LG;
            blob = 'None of the configured manifest paths were loaded';
        }
    } else if (nAll > nOk) {
        prefix = SB_WARN;
        blob = 'Some but not all configured manifest paths were loaded';
        postfix = clr.yellowBright(ratio);
    } else {
        throw new Error(`Unexpected: nAll < nOk`);
    }

    clog(`${prefix} ${blob} (${postfix})`);
}

async function validateManifestPathExists(filePath: string) : Promise<boolean> {
    const pathTag = fmtPath(filePath);

    try {
        await fs.promises.access(filePath).catch(() => {
            return false;
        });
    } catch (err) {
        throw new Error(`Error while validating manifest path existence ${pathTag}: ${err}`);
    }

    return true;
}

async function validateManifestPathIsSupportedFilesystemType(filePath: string, config: ConfigData) : Promise<boolean> {
    const pathTag = fmtPathAsTag(filePath);

    try {
        const stats = await fs.promises.stat(filePath);

        if (!stats.isFile() && !stats.isDirectory())
            clogConfigWarn(`Unsupported filesystem type (Supported: File or Folder) was set as a manifest path in the user ${USER_CONFIG_FILENAME}.`);

        const { scanDirectories, scanRecursively } = config.search;

        if (stats.isFile()) {
            return true;
        } else if (stats.isDirectory()) {
            if (!scanDirectories) {
                clogConfigWarn(`Manifests file path list contains a path pointing to a directory, but scanning directories is disabled by the user's ${USER_CONFIG_FILENAME}. The following path will be skipped: ${filePath}`);
                return false;
            }

            return true;
        } else {
            clogConfigWarn(`Unsupported filesystem type at the given path was ignored ${pathTag}`);
        }
    } catch (err) {
        throw new Error(`Could not stat manifest path ${filePath}: ${err}`);
    }
    
    return true;
}

async function readManifestFile(manPath: string) : Promise<object> {
    const pathTag = fmtPathAsTag(manPath);

    if (!manPath)
        throw new Error(`Required arg manPath was invalid ${manPath}`);
    if (manPath.trim() === '')
        throw new Error(`Required arg manPath cannot be empty ${manPath}`);

    try {
        const contents = await fs.promises.readFile(manPath, 'utf-8');
        const object = yaml.parse(contents);
        return object;
    } catch (err) {
        throw new Error(`Unable to read manifest file at manpath ${pathTag}: ${err}`);
    }
}

async function validateManifestFileContents(manPath: string, object: object) : Promise<ManifestData> {
    const pathTag = fmtPathAsTag(manPath);
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

    let shortcutsValue: object[] = [];

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
            shortcutsValue = value;
        }
    }

    // TODO REWRITE

    const hasAttrName = keyAliasUsedForName !== '',
          hasAttrRootDir = keyAliasUsedForRootDir !== '',
          hasAttrOutput = keyAliasUsedForOutput !== '',
          hasAttrShortcuts = keyAliasUsedForShortcuts !== '';
    const wasAttrNameAnAlias = keyAliasUsedForName !== '' && keyAliasUsedForName !== 'name',
          wasAttrRootDirAnAlias = keyAliasUsedForName !== '' && keyAliasUsedForName !== 'rootDirectory',
          wasAttrOutputAnAlias = keyAliasUsedForName !== '' && keyAliasUsedForName !== 'outputPath',
          wasAttrShortcutsAnAlias = keyAliasUsedForName !== '' && keyAliasUsedForName !== 'shortcuts';
    
    // Debug prints
    dlog(`MANIFEST FILE: ${fmtPath(manPath)}`);
    dlog(` ${checkCross(hasAttrName)} Has Optional Name Attribute`); // TODO checkWarn
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
        throw new Error(`Manifest is missing a root directory attribute ${pathTag}`); // TODO Make these errors land better, skip that one manifest + process remaining
    if (!hasAttrOutput)
        throw new Error(`Manifest is missing an output directory attribute ${pathTag}`);

    const instance = new Manifest(manPath, data);

    if (hasAttrShortcuts) {
        // TODO Load shortcuts

        data.shortcuts = await loadManifestShortcuts(instance, shortcutsValue);
    }

    return data;
}

function hasRequiredFields(obj: object) : obj is Shortcut {
    return Object.prototype.hasOwnProperty.call(obj, 'title') && Object.prototype.hasOwnProperty.call(obj, 'target');
}

async function loadManifestShortcuts(manifest: Manifest, shortcutsValue: object[]) : Promise<Shortcut[]> {
    dlogHeader(`MANIFEST ${quote(manifest.getName())} > ${clr.cyanBright('Load Shortcuts')}`);

    if (shortcutsValue.length === 0) {
        dlog(`  ${SB_WARN} Shortcuts value was empty so no shortcuts were added to the Manifest`);
        return [];
    }

    const okShortcuts: Shortcut[] = [];

    for (const [index, shortcutValue] of shortcutsValue.entries()) {
        const id = index+1;
        
        dlog(clr.cyanBright.underline(`SHORTCUT #${id} > Processing`));

        const hasRequired = hasRequiredFields(shortcutValue);
        dlog(`  ${checkCross(hasRequired)} Has required fields?`);
        if (!hasRequired) {
            dlog(`  Skipping Shortcut #${id}`);
            continue;
        }

        const shortcut = await makeShortcut(manifest, shortcutValue);        
        dlog(`${SB_OK_LG} Shortcut created: ${quote(shortcut.title)}`);
    }

    return okShortcuts;
}

async function makeShortcut(manifestData: ManifestData, obj: object) {
    const shortcutData: ShortcutData = {
        title: 'Testing!',
        target: '',
        enabled: true
    };

    for (const [key, value] of Object.entries(obj)) {
        dlog(` - ${key}: ${value}`);
    }

    return new Shortcut(manifestData, shortcutData);
}

export { makeManifests };