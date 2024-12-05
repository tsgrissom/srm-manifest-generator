import {
	clogConfigValueWrongType,
	dlogConfigSectionOk,
	dlogConfigWarnOptionalSectionSkippedWrongType,
	dlogConfigValueLoaded,
	dlogConfigWarnMissingOptionalSection,
	dlogConfigSectionStart,
	resolveKeyFromAlias,
	clogConfigValueUnknown
} from '../../../utility/config';

import UserConfig from '../../../type/config/UserConfig';
import ConfigKeyAliases from '../../../type/config/ConfigKeyAliases';

const sectionKey = 'other';
const keyAliases: ConfigKeyAliases = {
	useColor: 'useColor',
	debug: 'debug',
	debugging: 'debug',
	verbose: 'verbose',
	verbosity: 'verbose'
};

async function parseOtherSection(
	data: object,
	userConfig: UserConfig
): Promise<UserConfig> {
	if (!Object.keys(data).includes(sectionKey)) {
		dlogConfigWarnMissingOptionalSection(sectionKey);
		return userConfig;
	}

	const section = (data as Record<string, unknown>)[sectionKey];

	if (
		typeof section !== 'object' ||
		Array.isArray(section) ||
		section === null
	) {
		dlogConfigWarnOptionalSectionSkippedWrongType(
			sectionKey,
			'section',
			section
		);
		return userConfig;
	}

	dlogConfigSectionStart(sectionKey);

	for (const [key, value] of Object.entries(section)) {
		const resolved = resolveKeyFromAlias(keyAliases, key, sectionKey);
		const { fullGivenKey, resolvedKey } = resolved;

		switch (resolvedKey) {
			case 'debug': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				userConfig.other.debug = value;
				dlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'useColor': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				userConfig.other.useColor = value;
				dlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'verbose': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				userConfig.other.verbose = value;
				dlogConfigValueLoaded(resolved, value);
				break;
			}
			default: {
				clogConfigValueUnknown(fullGivenKey);
			}
		}
	}

	dlogConfigSectionOk(sectionKey);

	return userConfig;
}

export default parseOtherSection;
