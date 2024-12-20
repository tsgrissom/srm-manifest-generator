import {
	clogConfigFatalErrMissingRequiredSection,
	clogConfigFatalErrRequiredSectionWrongType,
	clogConfigKeyUnknown,
	clogConfigValueWrongType,
	dlogConfigSectionOk,
	dlogConfigSectionStart,
	resolveKeyFromAlias,
	vlogConfigValueLoaded,
} from '../../../util/config.js';
import { clog } from '../../../util/console.js';
import { quote } from '../../../util/string-wrap.js';
import { SB_ERR_SM, SB_WARN } from '../../../util/symbols.js';

import ConfigKeyAliases from '../../../type/config/ConfigKeyAliases.js';
import UserConfig from '../../../type/config/UserConfig.js';
import makeManifests from '../manifests.js';

const sectionKey = 'search';
const keyAliases: ConfigKeyAliases = {
	directories: 'scanDirectories',
	scanFolders: 'scanDirectories',
	folders: 'scanDirectories',
	recursively: 'scanRecursively',
	recursive: 'scanRecursively',
	sources: 'manifests',
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
			case 'scanDirectories': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.search.scanDirectories = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'scanRecursively': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.search.scanRecursively = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case `manifests`: {
				// TODO Maybe load manifests later, elsewhere
				// Maybe here we can just validate paths if needed, then have makeManifests in the UserConfig on demand?
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
					config.search.manifests = await makeManifests(value, config);
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
