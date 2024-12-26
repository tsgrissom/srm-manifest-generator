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
import { quote } from '../../util/string/quote.js';
import { UserConfig } from '../type/UserConfig.js';

const topLevelSectionKey = 'validate';

function parseValidateSection(data: object, config: UserConfig): UserConfig {
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

	if (!Object.keys(data).includes(topLevelSectionKey)) {
		dlogConfigWarnMissingOptionalSection(topLevelSectionKey);
		return config;
	}

	const section = (data as Record<string, unknown>)[topLevelSectionKey];

	if (typeof section !== 'object' || Array.isArray(section) || section === null) {
		dlogConfigWarnOptionalSectionSkippedWrongType(
			topLevelSectionKey,
			'section',
			section,
		);
		return config;
	}

	dlogConfigSectionStart(topLevelSectionKey);

	for (const [key, value] of Object.entries(section)) {
		const resolved = resolveKeyFromAlias(keyAliases, key, topLevelSectionKey);
		const { fullGivenKey, resolvedKey, givenKey } = resolved;

		switch (resolvedKey) {
			case 'filePaths': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.validate.filePaths = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'executables': {
				if (typeof value !== 'object' || Array.isArray(value)) {
					clogConfigValueWrongType(fullGivenKey, 'section', value);
					break;
				}

				// TODO Warn if this subsection is missing

				config = parseSubsectionExecutables(givenKey, value as object, config);
				break;
			}
			case 'configKeys': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.validate.configKeys = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'executableExtensions': {
			}
			default: {
				clogConfigKeyUnknown(fullGivenKey, config);
			}
		}
	}

	dlogConfigSectionOk(topLevelSectionKey);

	return config;
}

function parseSubsectionExecutables(
	givenSubsectionKey: string,
	data: object,
	config: UserConfig,
): UserConfig {
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

	const section = data as Record<string, unknown>;

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

				config.validate.executables.enabled = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'acceptedExtensions': {
				if (
					typeof value !== 'object' ||
					(!Array.isArray(value) && typeof value !== 'string')
				) {
					clogConfigValueWrongType(
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

				config.validate.executables.acceptedExtensions = normalized;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
		}
	}

	return config;
}

export default parseValidateSection;
