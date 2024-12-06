import clr from 'chalk';
import fs from 'node:fs/promises';
import YAML from 'yaml';

import { checkCross } from '../../utility/boolean';
import {
	clogConfigValueWrongType,
	clogConfigWarn,
	dlogConfigValueLoaded,
	resolveKeyFromAlias
} from '../../utility/config';
import { clog } from '../../utility/console';
import { dlog } from '../../utility/debug';
import { basenameWithoutExtensions, fmtPath, fmtPathAsTag } from '../../utility/path';
import { quote } from '../../utility/string';
import { SB_ERR_LG, SB_OK_LG, SB_WARN, UNICODE_ARRW_RIGHT } from '../../utility/symbols';

import ConfigData from '../../type/config/ConfigData';
import ConfigKeyAliases from '../../type/config/ConfigKeyAliases';
import Manifest from '../../type/manifest/Manifest';
import ManifestData from '../../type/manifest/ManifestData';

import UserConfig from '../../type/config/UserConfig';
import Shortcut from '../../type/shortcut/Shortcut';
import { USER_CONFIG_FILENAME } from '../load-data';
import loadManifestShortcuts from './shortcuts';

async function makeManifests(manPaths: string[], config: UserConfig): Promise<Manifest[]> {
	dlog(clr.magenta.underline('CREATING MANIFEST INSTANCES'));

	const okManifests: Manifest[] = [];

	if (manPaths.length === 0) {
		clog(
			`${SB_WARN} User ${USER_CONFIG_FILENAME} manifest paths was empty. No manifests will be loaded or processed.`
		);
		return okManifests;
	}

	for (const [index, manPath] of manPaths.entries()) {
		const id = index + 1;
		const pathTag = fmtPathAsTag(manPath);
		dlog(` > MANIFEST #${id}: Began validating manifest file ${pathTag}`);

		const exists = await validateManifestPathExists(manPath);
		const okFsType = await validateManifestPathIsSupportedFilesystemType(manPath, config);

		dlog(` ${checkCross(exists)} Path exists (${manPath})`);
		dlog(` ${checkCross(okFsType)} Path is a supported filesystem type ${pathTag}`);

		if (!exists) {
			clog(` > Skipping manifest (Path: ${manPath})`);
			continue;
		}

		const object = await readManifestFile(manPath);
		const data = parseManifestFileContentsToData(manPath, object, config);
		const instance = new Manifest(manPath, data);

		okManifests.push(instance);

		dlog(` ${SB_OK_LG} MANIFEST #${id}: Finished validation of manifest path ${fmtPathAsTag(pathTag)}`);
	}

	clogLoadedManifests(manPaths, okManifests);

	return okManifests;
}

function clogLoadedManifests(manifestPaths: string[], okManifests: Manifest[]) {
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

async function validateManifestPathExists(filePath: string): Promise<boolean> {
	const pathTag = fmtPath(filePath);

	try {
		await fs.access(filePath).catch(() => {
			return false;
		});
	} catch (err) {
		throw new Error(`Error while validating manifest path existence ${pathTag}: ${err}`);
	}

	return true;
}

async function validateManifestPathIsSupportedFilesystemType(
	filePath: string,
	config: ConfigData
): Promise<boolean> {
	const pathTag = fmtPathAsTag(filePath);

	try {
		const stats = await fs.stat(filePath);

		if (!stats.isFile() && !stats.isDirectory())
			clogConfigWarn(
				`Unsupported filesystem type (Supported: File or Folder) was set as a manifest path in the user ${USER_CONFIG_FILENAME}.`
			);

		const { scanDirectories, scanRecursively } = config.search;

		if (stats.isFile()) {
			return true;
		} else if (stats.isDirectory()) {
			if (!scanDirectories) {
				clogConfigWarn(
					`Manifests file path list contains a path pointing to a directory, but scanning directories is disabled by the user's ${USER_CONFIG_FILENAME}. The following path will be skipped: ${filePath}`
				);
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

async function readManifestFile(manPath: string): Promise<object> {
	const pathTag = fmtPathAsTag(manPath);

	if (!manPath) {
		throw new Error(`Arg filePath was invalid: ${manPath}`);
	}
	if (manPath.trim() === '') {
		throw new Error(`Arg filePath cannot be empty: ${manPath}`);
	}

	try {
		const contents = await fs.readFile(manPath, 'utf-8');
		const object = YAML.parse(contents) as ManifestData;
		return object;
	} catch (err) {
		throw new Error(`Unable to read manifest file at manpath ${pathTag}`);
	}
}

function parseManifestFileContentsToData(filePath: string, obj: object, config: UserConfig): ManifestData {
	const keyAliases: ConfigKeyAliases = {
		sourceName: 'sourceName',
		name: 'sourceName',

		baseDirectory: 'baseDirectory',
		baseDir: 'baseDirectory',
		directory: 'baseDirectory',
		root: 'baseDirectory',
		rootDir: 'baseDirectory',
		rootDirectory: 'baseDirectory',

		output: 'outputPath',
		outputPath: 'outputPath',
		outputFile: 'outputPath',
		out: 'outputPath',
		outputDirectory: 'outputPath',
		outputDir: 'outputPath',

		shortcuts: 'shortcuts',
		entries: 'shortcuts',
		titles: 'shortcuts'
	};
	const data: ManifestData = {
		sourceName: '',
		baseDirectory: '',
		outputPath: '',
		shortcuts: []
	};

	if (!Object.keys(obj)) {
		// TODO more graceful exit
		throw new Error('Manifest has no top level keys');
	}

	const document = obj as Record<string, unknown>;

	if (typeof document !== 'object' || Array.isArray(document) || document === null) {
		throw new Error(`Manifest is not an object (Type: ${typeof document})`);
	}

	dlog(UNICODE_ARRW_RIGHT + clr.underline(`Loading: Manifest ${fmtPathAsTag(filePath)}`));

	let hasShortcuts = false;

	for (const [key, value] of Object.entries(document)) {
		const resolved = resolveKeyFromAlias(keyAliases, key, null);
		const { fullGivenKey, resolvedKey } = resolved;

		switch (resolvedKey) {
			case 'sourceName': {
				if (typeof value !== 'string') {
					// Not a failure for Manifest
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				// TODO Check for empty

				data.sourceName = value;
				dlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'baseDirectory': {
				if (typeof value !== 'string') {
					// Manifest fails
					// TODO Soft fail this manifest only
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				// TODO Check for empty

				data.baseDirectory = value;
				dlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'outputPath': {
				if (typeof value !== 'string') {
					// Manifest fails
					// TODO Soft fail this manifest only
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				// TODO Check for empty

				data.outputPath = value;
				dlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'shortcuts': {
				if (
					typeof value === 'object' &&
					Array.isArray(value) &&
					value.every(element => element instanceof Shortcut)
				) {
					hasShortcuts = true;
					data.shortcuts = value;
					dlogConfigValueLoaded(resolved, value);
					break;
				}

				clogConfigValueWrongType(fullGivenKey, 'array of shortcut objects', value);
				break;
			}
			default: {
				if (config.shouldWarnUnknownConfigKey()) {
					clog(`  ${SB_WARN} Unknown key set at ${quote(fullGivenKey)}`);
				}
			}
		}
	}

	const pathTag = fmtPathAsTag(filePath);
	const hasSourceName = data.sourceName.trim() !== '';
	const hasBaseDirectory = data.baseDirectory.trim() !== '';
	const hasOutputPath = data.outputPath.trim() !== '';

	// TODO Below should be verbose
	dlog(`  ${checkCross(hasBaseDirectory)} Has required attribute "baseDirectory"?`);
	dlog(`  ${checkCross(hasOutputPath)} Has required attribute "outputPath"?`);
	dlog(`  ${checkCross(hasSourceName)} Has optional attribute "sourceName"?`);
	dlog(`  ${checkCross(hasShortcuts)} Has optional attribute "shortcuts"?`);

	// Fallback om filename
	if (!hasSourceName)
		data.sourceName = basenameWithoutExtensions(filePath, ['.yml', '.yaml', '.manifest'], true);
	// Make sure required attributes are present
	// TODO Soft fail these
	if (!hasBaseDirectory) throw new Error(`Manifest is missing a root directory attribute ${pathTag}`);
	if (!hasOutputPath) throw new Error(`Manifest is missing an output directory attribute ${pathTag}`);

	if (hasShortcuts) {
		const value = data.shortcuts;
		data.shortcuts = loadManifestShortcuts(data, value, config);
	}

	return data;
}

export default makeManifests;
