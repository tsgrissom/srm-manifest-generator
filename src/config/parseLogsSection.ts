import { UserConfig } from './type/UserConfig.js';
import {
	clogConfigKeyUnknown,
	clogConfigValueWrongType,
	dlogConfigSectionOk,
	dlogConfigSectionStart,
	dlogConfigWarnMissingOptionalSection,
	dlogConfigWarnOptionalSectionSkippedWrongType,
	vlogConfigValueLoaded,
} from './util/logging.js';
import { YamlKeyAliases, resolveKeyFromAlias } from './util/yamlKeys.js';

const sectionKey = 'logs';
const keyAliases: YamlKeyAliases = {
	enable: 'enabled',
	output: 'outputPath',
	outputFile: 'outputPath',
	fileName: 'nameFormat',
	format: 'nameFormat',
};

function parseLogsSection(data: object, config: UserConfig): UserConfig {
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
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'outputPath': {
				if (typeof value !== 'string') {
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				config.logs.outputPath = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'nameFormat': {
				if (typeof value !== 'string') {
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				config.logs.nameFormat = value;
				vlogConfigValueLoaded(resolved, value);
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
