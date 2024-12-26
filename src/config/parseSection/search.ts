import { YamlKeyAliases, resolveKeyFromAlias } from '../../util/file/yaml.js';
import {
	clogConfigFatalErrMissingRequiredSection,
	clogConfigFatalErrRequiredSectionWrongType,
	clogConfigKeyUnknown,
	clogConfigValueWrongType,
	dlogConfigSectionOk,
	dlogConfigSectionStart,
	vlogConfigValueLoaded,
} from '../../util/logging/config.js';
import { clog } from '../../util/logging/console.js';
import { quote } from '../../util/string/quote.js';
import { SB_ERR_SM, SB_WARN } from '../../util/string/symbols.js';
import createManifestInstances from '../loadManifests.js';
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

async function parseSearchSection(data: object, config: UserConfig): Promise<UserConfig> {
	if (!Object.keys(data).includes(sectionKey)) {
		clogConfigFatalErrMissingRequiredSection(sectionKey);
		process.exit();
	}

	const section = (data as Record<string, unknown>)[sectionKey];

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
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.search.withinDirectories = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'recursively': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.search.recursively = value;
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
					config.search.manifests = await createManifestInstances(
						value,
						config,
					);
					vlogConfigValueLoaded(resolved, value);
				} else {
					if (!Array.isArray(value)) {
						clogConfigValueWrongType(fullGivenKey, 'array of strings', value); // TODO Probably want a custom print here
					} else {
						clog(
							`   ${SB_ERR_SM} Values inside array value of key ${quote(fullResolvedKey)} must all be strings, but at least one was a non-string`,
						);
					}
				}

				break;
			}
			default: {
				clogConfigKeyUnknown(fullGivenKey, config);
			}
		}
	}

	dlogConfigSectionOk(sectionKey);

	return config;
}

export default parseSearchSection;
