import { YamlKeyAliases, resolveKeyFromAlias } from '../../util/file/yaml.js';
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

const sectionKey = 'validate';
const keyAliases: YamlKeyAliases = {
	filePaths: 'filePaths',
	paths: 'filePaths',

	executables: 'executables',
	exes: 'executables',

	executableExtensions: 'executableExtensions',
	acceptedExecutables: 'executableExtensions',

	unknownConfigKey: 'unknownConfigKeys',
	configKey: 'unknownConfigKeys',
	configKeys: 'unknownConfigKeys',
	unknownKey: 'unknownConfigKeys',
	unknownKeys: 'unknownConfigKeys',
};

function parseValidateSection(data: object, config: UserConfig): UserConfig {
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
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.validate.executables = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'unknownConfigKeys': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.validate.unknownConfigKeys = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'executableExtensions': {
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

				config.validate.executableExtensions = normalized;
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

export default parseValidateSection;
