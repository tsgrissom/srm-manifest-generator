import {
	clogConfigValueWrongType,
	clogConfigKeyUnknown,
	dlogConfigSectionOk,
	dlogConfigValueLoaded,
	dlogConfigSectionStart,
	dlogConfigWarnOptionalSectionSkippedWrongType,
	dlogConfigWarnMissingOptionalSection,
	resolveKeyFromAlias
} from '../../../utility/config';

import ConfigKeyAliases from '../../../type/config/ConfigKeyAliases';
import UserConfig from '../../../type/config/UserConfig';

const sectionKey = 'logs';
const keyAliases: ConfigKeyAliases = {
	enable: 'enabled',
	output: 'outputPath',
	outputFile: 'outputPath',
	fileName: 'nameFormat',
	format: 'nameFormat'
};

async function parseLogsSection(data: object, config: UserConfig): Promise<UserConfig> {
	if (!Object.keys(data).includes(sectionKey)) {
		dlogConfigWarnMissingOptionalSection(sectionKey);
		return config;
	}

	const section = (data as Record<string, unknown>)[sectionKey];

	if (typeof section !== 'object' || Array.isArray(section) || section === null) {
		dlogConfigWarnOptionalSectionSkippedWrongType(sectionKey, 'section', section);
		return config;
	}

	dlogConfigSectionStart(sectionKey);

	for (const [key, value] of Object.entries(section)) {
		const resolved = resolveKeyFromAlias(keyAliases, key, sectionKey);
		const { fullGivenKey, resolvedKey } = resolved;

		switch (resolvedKey) {
			case 'enabled': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.logs.enabled = value;
				dlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'outputPath': {
				if (typeof value !== 'string') {
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				config.logs.outputPath = value;
				dlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'nameFormat': {
				if (typeof value !== 'string') {
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				config.logs.nameFormat = value;
				dlogConfigValueLoaded(resolved, value);
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

export default parseLogsSection;
