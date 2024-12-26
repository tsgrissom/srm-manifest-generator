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
import { quote } from '../../util/string/quote.js';
import { ConfigData } from '../type/ConfigData.js';

const topLevelSectionKey = 'validate';

function parseValidateSection(rawData: object, parsedData: ConfigData): ConfigData {
	const keyAliases: YamlKeyAliases = {
		// Aliases for key "configKeys"
		configKey: 'configKeys',
		unknownConfigKey: 'configKeys',
		unknownConfigKeys: 'configKeys',
		unknownKey: 'configKeys',
		unknownKeys: 'configKeys',
		// Aliases for key "filePaths"
		filePath: 'filePaths',
		path: 'filePaths',
		paths: 'filePaths',
		// Aliases for subsection key "executables"
		executable: 'executables',
		exec: 'executables',
		execs: 'executables',
		exe: 'executables',
		exes: 'executables',
	};

	if (!Object.keys(rawData).includes(topLevelSectionKey)) {
		dlogConfigWarnMissingOptionalSection(topLevelSectionKey);
		return parsedData;
	}

	const section = (rawData as Record<string, unknown>)[topLevelSectionKey];

	if (typeof section !== 'object' || Array.isArray(section) || section === null) {
		dlogConfigWarnOptionalSectionSkippedWrongType(
			topLevelSectionKey,
			'section',
			section,
		);
		return parsedData;
	}

	dlogConfigSectionStart(topLevelSectionKey);

	for (const [key, value] of Object.entries(section)) {
		const resolved = resolveKeyFromAlias(keyAliases, key, topLevelSectionKey);
		const { fullGivenKey, resolvedKey, givenKey } = resolved;

		switch (resolvedKey) {
			case 'filePaths': {
				if (typeof value !== 'boolean') {
					logConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				parsedData.validate.filePaths = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'executables': {
				if (typeof value !== 'object' || Array.isArray(value)) {
					logConfigValueWrongType(fullGivenKey, 'section', value);
					break;
				}

				// TODO Warn if this subsection is missing

				parsedData = parseSubsectionExecutables(givenKey, value as object, parsedData);
				break;
			}
			case 'configKeys': {
				if (typeof value !== 'boolean') {
					logConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				parsedData.validate.configKeys = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'executableExtensions': {
			}
			default: {
				clogConfigKeyUnknown(fullGivenKey, parsedData);
			}
		}
	}

	dlogConfigSectionOk(topLevelSectionKey);

	return parsedData;
}

function parseSubsectionExecutables(
	givenSubsectionKey: string,
	rawData: object,
	parsedData: ConfigData,
): ConfigData {
	const fullSubsectionKey = joinPathKeys(topLevelSectionKey, givenSubsectionKey);
	const keyAliases: YamlKeyAliases = {
		// Aliases for key "enabled"
		enable: 'enabled',
		// TODO Disable key
		// Aliases for key "acceptedExtensions"
		accepted: 'acceptedExtensions',
		acceptedExt: 'acceptedExtensions',
		acceptedExtensions: 'acceptedExtensions',
		acceptable: 'acceptedExtensions',
		acceptableExtensions: 'acceptedExtensions',
		accept: 'acceptedExtensions',
		acceptExtensions: 'acceptedExtensions',
		validExt: 'acceptedExtensions',
		validExtension: 'acceptedExtensions',
		validExtensions: 'acceptedExtensions',
		okExt: 'acceptedExtensions',
		okExtension: 'acceptedExtensions',
		okExtensions: 'acceptedExtensions',
		executableExtension: 'acceptedExtensions',
		executableExtensions: 'acceptedExtensions',
	};

	const section = rawData as Record<string, unknown>;

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

				parsedData.validate.executables.enabled = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'acceptedExtensions': {
				if (
					typeof value !== 'object' ||
					(!Array.isArray(value) && typeof value !== 'string')
				) {
					logConfigValueWrongType(
						fullGivenKey,
						'string or array of strings',
						value,
					); // TOOD Check each entry inside array too
					break;
				}

				// TODO Test normalization
				let normalized: Array<string>;

				if (typeof value === 'string') {
					normalized = [value];
				} else if (
					typeof value === 'object' &&
					Array.isArray(value) &&
					value.every(each => typeof each === 'string')
				) {
					normalized = value;
				} else {
					throw new TypeError(
						`Unexpected: Could not convert config value ${quote(fullGivenKey)} into an array`,
					);
				}

				parsedData.validate.executables.acceptedExtensions = normalized;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
		}
	}

	return parsedData;
}

export default parseValidateSection;
