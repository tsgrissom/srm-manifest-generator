import {
	YamlKeyAliases,
	joinPathKeys,
	resolveKeyFromAlias,
} from '../../util/file/yaml.js';
import {
	clogConfigKeyUnknown,
	logConfigValueWrongType,
	dlogConfigSectionOk,
	dlogConfigSectionStart,
	dlogConfigWarnMissingOptionalSection,
	dlogConfigWarnOptionalSectionSkippedWrongType,
	vlogConfigValueLoaded,
} from '../../util/logging/config.js';
import { ConfigData } from '../type/ConfigData.js';

const topLevelSectionKey = 'log';

// MARK: Top Section
function parseLogSection(rawData: object, parsedData: ConfigData): ConfigData {
	if (!Object.keys(rawData).includes(topLevelSectionKey)) {
		dlogConfigWarnMissingOptionalSection(topLevelSectionKey);
		return parsedData;
	}

	const section = (rawData as Record<string, unknown>)[topLevelSectionKey];

	if (typeof section !== 'object' || Array.isArray(rawData) || section === null) {
		dlogConfigWarnOptionalSectionSkippedWrongType(
			topLevelSectionKey,
			'section',
			section,
		);
		return parsedData;
	}

	dlogConfigSectionStart(topLevelSectionKey);

	parsedData = parseSubsectionConsole(section, parsedData);
	parsedData = parseSubsectionFile(section, parsedData);

	dlogConfigSectionOk(topLevelSectionKey);

	return parsedData;
}

// MARK: Console Subsect
function parseSubsectionConsole(rawData: object, parsedData: ConfigData): ConfigData {
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

	if (!Object.keys(rawData).includes(sectionKey)) {
		dlogConfigWarnMissingOptionalSection(fullSubsectionKey);
		return parsedData;
	}

	const section = (rawData as Record<string, unknown>)[sectionKey];

	if (typeof section !== 'object' || Array.isArray(section) || section === null) {
		dlogConfigWarnOptionalSectionSkippedWrongType(
			fullSubsectionKey,
			'section',
			section,
		);
		return parsedData;
	}

	dlogConfigSectionStart(fullSubsectionKey);

	for (const [key, value] of Object.entries(section)) {
		const resolved = resolveKeyFromAlias(keyAliases, key, fullSubsectionKey);
		const { fullGivenKey, resolvedKey } = resolved;

		switch (resolvedKey) {
			case 'debug': {
				if (typeof value !== 'boolean') {
					logConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				parsedData.log.console.debug = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'withColor': {
				if (typeof value !== 'boolean') {
					logConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				parsedData.log.console.withColor = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'verbose': {
				if (typeof value !== 'boolean') {
					logConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				parsedData.log.console.verbose = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			default: {
				clogConfigKeyUnknown(fullGivenKey, parsedData);
			}
		}
	}

	return parsedData;
}

// MARK: File Subsect
function parseSubsectionFile(rawData: object, parsedData: ConfigData): ConfigData {
	const sectionKey = 'file';
	const fullSubsectionKey = joinPathKeys(topLevelSectionKey, sectionKey);
	const keyAliases: YamlKeyAliases = {
		enable: 'enabled',
		output: 'outputPath',
		outputFile: 'outputPath',
		fileName: 'nameFormat',
		format: 'nameFormat',
	};

	if (!Object.keys(rawData).includes(sectionKey)) {
		dlogConfigWarnMissingOptionalSection(fullSubsectionKey);
		return parsedData;
	}

	const section = (rawData as Record<string, unknown>)[sectionKey];

	if (typeof section !== 'object' || Array.isArray(section) || section === null) {
		dlogConfigWarnOptionalSectionSkippedWrongType(
			fullSubsectionKey,
			'section',
			section,
		);
		return parsedData;
	}

	dlogConfigSectionStart(fullSubsectionKey);

	for (const [key, value] of Object.entries(section)) {
		const resolved = resolveKeyFromAlias(keyAliases, key, fullSubsectionKey);
		const { fullGivenKey, resolvedKey } = resolved;

		switch (resolvedKey) {
			case 'enabled': {
				if (typeof value !== 'boolean') {
					logConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				parsedData.log.file.enabled = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'outputPath': {
				if (typeof value !== 'string') {
					logConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				parsedData.log.file.outputPath = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'nameFormat': {
				if (typeof value !== 'string') {
					logConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				parsedData.log.file.nameFormat = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			default: {
				clogConfigKeyUnknown(fullGivenKey, parsedData);
			}
		}
	}

	return parsedData;
}

export default parseLogSection;
