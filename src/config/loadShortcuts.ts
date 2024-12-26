import clr from 'chalk';

import { clog } from '../util/logging/console.js';
import { quote } from '../util/string/quote.js';

import { ManifestData } from '../app/type/ManifestData.js';
import Shortcut from '../app/type/Shortcut.js';
import { isShortcutData, ShortcutData } from '../app/type/ShortcutData.js';
import { resolveKeyFromAlias, YamlKeyAliases } from '../util/file/yaml.js';
import {
	logConfigValueWrongType,
	vlogConfigValueLoaded,
} from '../util/logging/config.js';
import { dlog, vlog, vlogList } from '../util/logging/debug.js';
import * as fmt from '../util/string/format.js';
import { yesNo } from '../util/string/format.js';
import {
	SB_BULLET,
	SB_ERR_LG,
	SB_ERR_SM,
	SB_OK_LG,
	SB_OK_SM,
	SB_SECT_END_OK,
	SB_SECT_START,
	SB_WARN,
} from '../util/string/symbols.js';
import { UserConfig } from './type/UserConfig.js';

// MARK: ParsedObjectsIntoShortcutDataResult
interface ParsedObjectsIntoShortcutDataResult {
	readonly validShortcuts: Array<ShortcutData>;
	readonly invalidShortcuts: Array<object>; // TODO Have manifest track its invalidShortcuts
	readonly count: {
		readonly objects: number;
		readonly nonObjects: number;
	};
}

// MARK: parseObjectsIntoArrayOfShortcutData
function parseObjectsIntoArrayOfShortcutData(
	arr: Array<unknown>,
	parent?: ManifestData,
	// config?: ConfigData,
): ParsedObjectsIntoShortcutDataResult {
	const manName = parent?.sourceName ?? 'Unknown';

	const validShortcuts: Array<ShortcutData> = [];
	const invalidShortcuts: Array<object> = [];
	let countNonObjects = 0;
	let countObjects = 0;

	for (const element of arr) {
		if (typeof element !== 'object') {
			console.error(
				clr.red(
					`Unable to parse non-object into shortcut data (in manifest: ${quote(manName)})`,
				),
			);
			console.error(element);
			countNonObjects++;
			continue;
		}

		if (element === null) {
			console.error(
				clr.red(
					`Unable to parse null into shortcut data (in manifest: ${quote(manName)})`,
				),
			);
			countNonObjects++;
			continue;
		}

		countObjects++;

		if (!isShortcutData(element)) {
			clog(
				`  ${SB_ERR_SM} Invalid shortcut data found in manifest ${quote(manName)}:`,
			);
			console.log(element);
			invalidShortcuts.push(element);
			continue;
		}

		const isEnabled = element.enabled ?? true;
		const fmtTitle = quote(element.title);
		const fmtTarget = fmt.path(element.target);
		const fmtEnabled = yesNo(isEnabled);

		vlog(`  ${SB_OK_SM} Valid shortcut data for title ${fmtTitle}`);
		vlogList(
			`     ${SB_BULLET} `,
			`From Manifest: ${manName}`,
			`Title: ${fmtTitle}`,
			`Target: ${fmtTarget}`,
			`Enabled? ${fmtEnabled}`,
		);

		validShortcuts.push(element);
	}

	return {
		validShortcuts: validShortcuts,
		invalidShortcuts: invalidShortcuts,
		count: {
			objects: countObjects,
			nonObjects: countNonObjects,
		},
	};
}

// MARK: validateParseShortcutObjectsIntoDataSuccessful
/**
 * Reads the results of a {@link ParsedObjectsIntoShortcutDataResult},
 * logging important info to the appropriate levels,
 * and returning a `boolean` which indicates whether
 * the result was a pass or a fail (`true` or `false`.)
 *
 * @param result The result to validate.
 * @param sourceName Provides a parent name for attribution
 *  in debug logs. Usually a manifest, but could be another
 *  source.
 * @returns Whether the given result passed or failed.
 *  `true` is pass, `false` is fail.
 */
// TODO Move all this to its own namespace, maybe its own file `shortcut-data.ts` or to `shortcut.ts`?
function validateParseShortcutObjectsIntoDataSuccessful(
	result: ParsedObjectsIntoShortcutDataResult,
	sourceName = 'Unknown',
): boolean {
	const nTotal = result.count.objects;
	const nNonObjects = result.count.nonObjects;
	const nValid = result.validShortcuts.length;
	const nInvalid = result.invalidShortcuts.length;

	if (nTotal <= 0) {
		dlog(
			`${SB_OK_LG} Loaded no shortcut data because there was none to load (Manifest: ${quote(sourceName)})`,
		);
		return true;
	}

	if (nTotal > 0) {
		if (nInvalid === nTotal) {
			clog(
				`${SB_ERR_LG} All shortcut data in manifest ${quote(sourceName)} was invalid`,
			);
			return false;
		}

		if (nValid === nTotal) {
			dlog(
				`${SB_OK_LG} All shortcut data in manifest ${quote(sourceName)} was valid`,
			);
			return true;
		}
	}

	const nErrored = nInvalid + nNonObjects;
	clog(`${SB_WARN} Some shortcut data in manifest ${quote(sourceName)} failed to load`);

	if (nValid > 0) {
		clog(`  ${SB_OK_SM} ${nValid}/${nTotal} shortcut data was valid`);
	}

	if (nInvalid > 0) {
		clog(`  ${SB_ERR_SM} ${nInvalid}/${nErrored} failed shortcut data was invalid`);
	}

	if (nNonObjects > 0) {
		clog(
			`  ${SB_ERR_SM} ${nNonObjects}/${nErrored} failed shortcut data was a non-object`,
		);
	}

	if (nErrored > 0) {
		clog(
			`  ${SB_ERR_SM} Some shortcuts from manifest ${sourceName} failed to load (${nErrored} failed)`,
			`  - To view the failed shortcut, re-execute with the ${clr.italic('--debug')} flag`,
		);
	}

	return true;
}

// MARK: createShortcutFromData
function createShortcutFromData(rawData: ShortcutData, config: UserConfig): Shortcut {
	const keyAliases: YamlKeyAliases = {
		title: 'title',
		name: 'title',

		target: 'target',
		exec: 'target',

		enabled: 'enabled',
		enable: 'enabled',

		disabled: 'disabled',
		disable: 'disabled',
	};

	const data: ShortcutData = {
		title: '',
		target: '',
		enabled: true,
	};

	if (!Object.keys(rawData)) {
		// TODO More graceful
		throw new Error('Shortcut has no keys');
	}

	const document = rawData as object as Record<string, unknown>;

	if (typeof document !== 'object' || Array.isArray(document) || document === null) {
		throw new Error(`Shortcut is not an object (Type: ${typeof document})`);
	}

	for (const [key, value] of Object.entries(document)) {
		const resolved = resolveKeyFromAlias(keyAliases, key);
		const { fullGivenKey, resolvedKey } = resolved;

		// TODO Based on where I left off, shortcut title bug observations:
		// * Doesn't hit the green bg logs below, meaning resolve key from alias is not succeeding for some reason

		switch (resolvedKey) {
			case 'title': {
				if (typeof value !== 'string') {
					logConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				// TODO CHeck for empty

				data.title = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'target': {
				if (typeof value !== 'string') {
					logConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				// TODO CHeck for empty

				data.target = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'enabled': {
				if (typeof value !== 'boolean') {
					logConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				data.enabled = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'disabled': {
				if (typeof value !== 'boolean') {
					logConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				data.enabled = !value;
				vlogConfigValueLoaded(resolved, !value);
				break;
			}
			default: {
				if (config.shouldWarnUnknownConfigKey) {
					clog(`  ${SB_WARN} Unknown key set at ${quote(fullGivenKey)}`);
				}
			}
		}
	}

	return new Shortcut(data, config);
}

function createShortcutsFromData(
	arr: Array<ShortcutData>,
	config: UserConfig,
): Array<Shortcut> {
	const shortcuts: Array<Shortcut> = [];

	for (const [index, data] of arr.entries()) {
		const id = index + 1;
		dlog(`${SB_SECT_START}Creating: Shortcut #${id}`);

		try {
			const sc = createShortcutFromData(data, config);
			dlog(`${SB_SECT_END_OK}Created: Shortcut #${id} (${quote(sc.title)})`);
			shortcuts.push(sc);
		} catch {
			console.error(
				clr.red(
					`Something went wrong while creating a Shortcut instances from ShortcutData:`,
				),
			);
			console.error(data);
			continue;
		}
	}

	return shortcuts;
}

export {
	createShortcutsFromData,
	parseObjectsIntoArrayOfShortcutData,
	validateParseShortcutObjectsIntoDataSuccessful,
};
