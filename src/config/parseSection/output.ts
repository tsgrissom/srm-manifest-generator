import { YamlKeyAliases, resolveKeyFromAlias } from '../../util/file/yaml.js';
import {
	clogConfigKeyUnknown,
	clogConfigValueUnknown,
	clogConfigValueWrongType,
	dlogConfigSectionOk,
	dlogConfigSectionStart,
	dlogConfigWarnMissingOptionalSection,
	dlogConfigWarnOptionalSectionSkippedWrongType,
	vlogConfigValueLoaded,
} from '../../util/logging/config.js';
import { OutputMode } from '../type/ConfigData.js';
import { UserConfig } from '../type/UserConfig.js';

const sectionKey = 'output';
const keyAliases: YamlKeyAliases = {
	minification: 'minify',
	indentationSpaces: 'indentSpaces',
	indentLevel: 'indentSpaces',
	outputMode: 'mode',
	spreadMode: 'mode',
};

function parseOutputSection(data: object, config: UserConfig): UserConfig {
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
			case 'minify': {
				if (typeof value !== 'boolean') {
					clogConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				config.output.minify = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'indentSpaces': {
				if (typeof value !== 'number') {
					clogConfigValueWrongType(fullGivenKey, 'number', value);
					break;
				}

				config.output.indentSpaces = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'mode': {
				if (typeof value !== 'string') {
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				const valueLow = value.toLowerCase();

				if (valueLow === 'combine') config.output.mode = OutputMode.Combine;
				else if (valueLow === 'spread') config.output.mode = OutputMode.Spread;
				else {
					clogConfigValueUnknown(fullGivenKey, value);
					break;
				}

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

export default parseOutputSection;
