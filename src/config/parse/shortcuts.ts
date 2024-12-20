import clr from 'chalk';

import {
	clogConfigValueWrongType,
	resolveKeyFromAlias,
	vlogConfigValueLoaded,
} from '../../utility/config.js';
import { clog } from '../../utility/console.js';
import { dlog, vlog } from '../../utility/debug.js';
import { quote } from '../../utility/string-wrap.js';
import {
	SB_ERR_LG,
	SB_OK_LG,
	SB_SECT_END_OK,
	SB_SECT_START,
	SB_WARN,
} from '../../utility/symbols.js';

import ConfigKeyAliases from '../../type/config/ConfigKeyAliases.js';
import UserConfig from '../../type/config/UserConfig.js';
import ManifestData from '../../type/manifest/ManifestData.js';
import Shortcut from '../../type/shortcut/Shortcut.js';
import { ShortcutData } from '../../type/shortcut/ShortcutData.js';

/**
 *
 * @param manifest
 * @param object The value of a given manifest's shortcuts field.
 * @returns
 */
function loadManifestShortcuts(
	manifest: ManifestData,
	objects: Array<object>,
	config: UserConfig,
): Array<Shortcut> {
	const manName = manifest.sourceName;
	dlog('');
	dlog(clr.cyanBright.underline(`LOADING SHORTCUTS FROM MANIFEST ${quote(manName)}`));

	if (objects.length === 0) {
		dlog(`  ${SB_WARN} There were no shortcuts to load from manifest ${manName}`);
		return [];
	}

	const ok: Array<Shortcut> = [];
	const nAll = objects.length;

	vlog(`  ${nAll} total shortcuts in this manifest`);

	for (const [index, object] of objects.entries()) {
		const id = index + 1;
		dlog(`${SB_SECT_START}Creating: Shortcut #${id}`);
		const shortcut = makeShortcut(object, config);
		dlog(`${SB_SECT_END_OK}Created: Shortcut #${id} (${quote(shortcut.title)})`);
		ok.push(shortcut);
	}

	const nOk = ok.length;

	if (nOk <= 0) {
		if (nAll === 0) {
			dlog(`${SB_OK_LG} There were no shortcuts to load from manifest ${manName}`);
		} else {
			dlog(
				`${SB_ERR_LG} All shortcuts for manifest ${manName} failed to load (${nOk} out of ${nAll})`,
			);
		}
	} else {
		if (nOk === nAll) {
			dlog(
				`${SB_OK_LG} All shortcuts for manifest ${manName} were loaded successfully (${nOk})`,
			);
		} else {
			dlog(
				`${SB_OK_LG} ${nOk} out of ${nAll} configured shortcuts were successfully`,
			);
		}
	}

	return ok;
}

function makeShortcut(obj: object, config: UserConfig): Shortcut {
	const keyAliases: ConfigKeyAliases = {
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

	if (!Object.keys(obj)) {
		// TODO More graceful
		throw new Error('Shortcut has no keys');
	}

	const document = obj as Record<string, unknown>;

	if (typeof document !== 'object' || Array.isArray(document) || document === null) {
		throw new Error(`Shortcut is not an object (Type: ${typeof document})`);
	}

	for (const [key, value] of Object.entries(document)) {
		const resolved = resolveKeyFromAlias(keyAliases, key, null);
		const { fullGivenKey, resolvedKey } = resolved;

		switch (resolvedKey) {
			case 'title': {
				if (typeof value !== 'string') {
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				// TODO CHeck for empty

				data.title = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'target': {
				if (typeof value !== 'string') {
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				// TODO CHeck for empty

				data.target = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'enabled': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				data.enabled = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'disabled': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				data.enabled = !value;
				vlogConfigValueLoaded(resolved, !value);
				break;
			}
			default: {
				if (config.shouldWarnUnknownConfigKey()) {
					clog(`  ${SB_WARN} Unknown key set at ${quote(fullGivenKey)}`);
				}
			}
		}
	}

	// TODO Lint data after the fact

	return new Shortcut(data, config);
}

export default loadManifestShortcuts;
