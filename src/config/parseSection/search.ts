import { YamlKeyAliases, resolveKeyFromAlias } from '../../util/file/yaml.js';
import {
	clogConfigFatalErrMissingRequiredSection,
	clogConfigFatalErrRequiredSectionWrongType,
	clogConfigKeyUnknown,
	logConfigValueWrongType,
	dlogConfigSectionOk,
	dlogConfigSectionStart,
	vlogConfigValueLoaded,
} from '../../util/logging/config.js';
import { clog } from '../../util/logging/console.js';
import { quote } from '../../util/string/quote.js';
import { SB_ERR_SM, SB_WARN } from '../../util/string/symbols.js';
import createManifestInstances from '../loadManifests.js';
import { ConfigData } from '../type/ConfigData.js';
import { UserConfig } from '../type/UserConfig.js';

const sectionKey = 'search';
const keyAliases: YamlKeyAliases = {
	// Aliases for key "withinDirectories"
	dirs: 'withinDirectories',
	directories: 'withinDirectories',
	folders: 'withinDirectories',
	withinDirs: 'withinDirectories',
	withinFolders: 'withinDirectories',
	inDirectories: 'withinDirectories',
	inDirs: 'withinDirectories',
	inFolders: 'withinDirectories',
	scanDirectories: 'withinDirectories',
	scanDirs: 'withinDirectories',
	scanFolders: 'withinDirectories',
	// Aliases for key "recursively"
	recursive: 'recursively',
	scanRecursively: 'recursively',
	// Aliases for key "manifests"
	sources: 'manifests',
	manifestPaths: 'manifests',
	manifestsPaths: 'manifests',
};

async function parseSearchSection(rawData: object, parsedData: ConfigData): Promise<ConfigData> {
	if (!Object.keys(rawData).includes(sectionKey)) {
		clogConfigFatalErrMissingRequiredSection(sectionKey);
		process.exit();
	}

	const section = (rawData as Record<string, unknown>)[sectionKey];

	if (typeof section !== 'object' || Array.isArray(section) || section === null) {
		clogConfigFatalErrRequiredSectionWrongType(sectionKey, 'section', section);
		process.exit();
	}

	dlogConfigSectionStart(sectionKey);

	for (const [key, value] of Object.entries(section)) {
		const resolved = resolveKeyFromAlias(keyAliases, key, sectionKey);
		const { fullGivenKey, resolvedKey, fullResolvedKey } = resolved;

		switch (resolvedKey) {
			case 'withinDirectories': {
				if (typeof value !== 'boolean') {
					logConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				parsedData.search.withinDirectories = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'recursively': {
				if (typeof value !== 'boolean') {
					logConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				parsedData.search.recursively = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case `manifests`: {
				if (!value) {
					console.log(
						`${SB_WARN} No manifest paths were provided at config key ${quote(fullResolvedKey)} so no manifests were loaded`,
					);
					break;
				}

				if (
					Array.isArray(value) &&
					value.every(item => typeof item === 'string')
				) {
					// TODO Shouldn't be using new UserConfig here, but once manifests load at a later step this can be removed
					parsedData.search.manifests = await createManifestInstances(
						value,
						new UserConfig(parsedData),
					);
					vlogConfigValueLoaded(resolved, value);
				} else {
					if (!Array.isArray(value)) {
						logConfigValueWrongType(fullGivenKey, 'array of strings', value); // TODO Probably want a custom print here
					} else {
						clog(
							`   ${SB_ERR_SM} Values inside array value of key ${quote(fullResolvedKey)} must all be strings, but at least one was a non-string`,
						);
					}
				}

				break;
			}
			default: {
				clogConfigKeyUnknown(fullGivenKey, parsedData);
			}
		}
	}

	dlogConfigSectionOk(sectionKey);

	return parsedData;
}

export default parseSearchSection;
