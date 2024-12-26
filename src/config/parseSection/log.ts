import {
	YamlKeyAliases,
	joinPathKeys,
	resolveKeyFromAlias,
} from '../../util/file/yaml.js';
import {
	clogConfigKeyUnknown,
	clogConfigValueWrongType,
	dlogConfigSectionOk,
	dlogConfigSectionStart,
	dlogConfigWarnMissingOptionalSection,
	dlogConfigWarnOptionalSectionSkippedWrongType,
	vlogConfigValueLoaded,
} from '../../util/logging/config.js';
import { UserConfig } from '../type/UserConfig.js';

const topLevelSectionKey = 'log';

function parseLogSection(data: object, config: UserConfig): UserConfig {
	if (!Object.keys(data).includes(topLevelSectionKey)) {
		dlogConfigWarnMissingOptionalSection(topLevelSectionKey);
		return config;
	}

	const section = (data as Record<string, unknown>)[topLevelSectionKey];

	if (typeof section !== 'object' || Array.isArray(data) || section === null) {
		dlogConfigWarnOptionalSectionSkippedWrongType(
			topLevelSectionKey,
			'section',
			section,
		);
		return config;
	}

	dlogConfigSectionStart(topLevelSectionKey);

	config = parseSubsectionConsole(section, config);
	config = parseSubsectionFile(section, config);

	dlogConfigSectionOk(topLevelSectionKey);

	return config;
}

function parseSubsectionConsole(data: object, config: UserConfig): UserConfig {
	const sectionKey = 'console';
	const fullSubsectionKey = joinPathKeys(topLevelSectionKey, sectionKey);
	const keyAliases: YamlKeyAliases = {
		// Aliases for key "withColor"
		useColor: 'withColor',
		color: 'withColor',
		// Aliases for key "debug"
		debugging: 'debug',
		// Aliases for key "verbose"
		verbosity: 'verbose',
	};

	if (!Object.keys(data).includes(sectionKey)) {
		dlogConfigWarnMissingOptionalSection(fullSubsectionKey);
		return config;
	}

	const section = (data as Record<string, unknown>)[sectionKey];

	if (typeof section !== 'object' || Array.isArray(section) || section === null) {
		dlogConfigWarnOptionalSectionSkippedWrongType(
			fullSubsectionKey,
			'section',
			section,
		);
		return config;
	}

	dlogConfigSectionStart(fullSubsectionKey);

	for (const [key, value] of Object.entries(section)) {
		const resolved = resolveKeyFromAlias(keyAliases, key, fullSubsectionKey);
		const { fullGivenKey, resolvedKey } = resolved;

		switch (resolvedKey) {
			case 'debug': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.log.console.debug = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'withColor': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.log.console.withColor = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'verbose': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.log.console.verbose = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			default: {
				clogConfigKeyUnknown(fullGivenKey, config);
			}
		}
	}

	return config;
}

function parseSubsectionFile(data: object, config: UserConfig): UserConfig {
	const sectionKey = 'file';
	const fullSubsectionKey = joinPathKeys(topLevelSectionKey, sectionKey);
	const keyAliases: YamlKeyAliases = {
		enable: 'enabled',
		output: 'outputPath',
		outputFile: 'outputPath',
		fileName: 'nameFormat',
		format: 'nameFormat',
	};

	if (!Object.keys(data).includes(sectionKey)) {
		dlogConfigWarnMissingOptionalSection(fullSubsectionKey);
		return config;
	}

	const section = (data as Record<string, unknown>)[sectionKey];

	if (typeof section !== 'object' || Array.isArray(section) || section === null) {
		dlogConfigWarnOptionalSectionSkippedWrongType(
			fullSubsectionKey,
			'section',
			section,
		);
		return config;
	}

	dlogConfigSectionStart(fullSubsectionKey);

	for (const [key, value] of Object.entries(section)) {
		const resolved = resolveKeyFromAlias(keyAliases, key, fullSubsectionKey);
		const { fullGivenKey, resolvedKey } = resolved;

		switch (resolvedKey) {
			case 'enabled': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.log.file.enabled = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'outputPath': {
				if (typeof value !== 'string') {
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				config.log.file.outputPath = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'nameFormat': {
				if (typeof value !== 'string') {
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				config.log.file.nameFormat = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			default: {
				clogConfigKeyUnknown(fullGivenKey, config);
			}
		}
	}

	return config;
}

export default parseLogSection;
