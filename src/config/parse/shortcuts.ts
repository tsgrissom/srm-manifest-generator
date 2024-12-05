import clr from 'chalk';

import { clogConfigValueWrongType, dlogConfigValueLoaded, resolveKeyFromAlias } from '../../utility/config';
import { clog } from '../../utility/console';
import { dlog, dlogHeader } from '../../utility/debug';
import { SB_OK_LG, SB_WARN, UNICODE_ARRW_RIGHT } from '../../utility/symbols';

import ManifestData from '../../type/manifest/ManifestData';
import { quote } from '../../utility/string';
import Shortcut from '../../type/shortcut/Shortcut';
import ShortcutData from '../../type/shortcut/ShortcutData';
import ConfigKeyAliases from '../../type/config/ConfigKeyAliases';
import UserConfig from '../../type/config/UserConfig';

/**
 *
 * @param manifest
 * @param object The value of a given manifest's shortcuts field.
 * @returns
 */
async function loadManifestShortcuts(
	manifest: ManifestData,
	objects: object[],
	config: UserConfig
): Promise<Shortcut[]> {
	dlogHeader(`MANIFEST ${quote(manifest.sourceName)} > ${clr.cyanBright('Load Shortcuts')}`);

	if (objects.length === 0) {
		dlog(`  ${SB_WARN} Shortcuts value was empty so no shortcuts were added to the Manifest`);
		return [];
	}

	const ok: Shortcut[] = [];

	for (const object of objects) {
		const shortcut = await makeShortcut(object, config);
		dlog(`${SB_OK_LG} Shortcut created: ${quote(shortcut.title)}`);
		ok.push(shortcut);
	}

	return ok;
}

async function makeShortcut(obj: object, config: UserConfig) {
	const keyAliases: ConfigKeyAliases = {
		title: 'title',
		name: 'title',

		target: 'target',
		exec: 'target',

		enabled: 'enabled',
		enable: 'enabled',

		disabled: 'disabled',
		disable: 'disabled'
	};

	const data: ShortcutData = {
		title: '',
		target: '',
		enabled: true
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
				dlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'target': {
				if (typeof value !== 'string') {
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				// TODO CHeck for empty

				data.target = value;
				dlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'enabled': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				data.enabled = value;
				dlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'disabled': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				data.enabled = !value;
				dlogConfigValueLoaded(resolved, !value);
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
