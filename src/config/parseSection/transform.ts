import chalk from 'chalk/index.js';
import { ResolvedYamlKey, YamlKeyAliases, resolveKeyFromAlias } from '../../util/file/yaml.js';
import {
	clogConfigKeyUnknown,
	logConfigValueUnknown,
	logConfigValueWrongType,
	dlogConfigSectionOk,
	dlogConfigSectionStart,
	dlogConfigWarnMissingOptionalSection,
	dlogConfigWarnOptionalSectionSkippedWrongType,
	vlogConfigValueLoaded,
	logConfigValueUnknownWithSuggestions,
} from '../../util/logging/config.js';
import { ConfigData, OutputMode } from '../type/ConfigData.js';
import { enumValue } from '../../util/string/format.js';

const sectionKey = 'transform';
const keyAliases: YamlKeyAliases = {
	// Aliases for key "minify"
	minification: 'minify',
	// Aliases for key "indentationSpaces"
	indentSpaces: 'indentationSpaces',
	indentLevel: 'indentationSpaces',
	indentationLevel: 'indentationSpaces',
	indent: 'indentationSpaces',
	// Aliases for key "outputMode"
	spreadMode: 'outputMode',
	mode: 'outputMode'
};

function parseTransformSection(rawData: object, parsedData: ConfigData): ConfigData {
	if (!Object.keys(rawData).includes(sectionKey)) {
		dlogConfigWarnMissingOptionalSection(sectionKey);
		return parsedData;
	}

	const section = (rawData as Record<string, unknown>)[sectionKey];

	if (typeof section !== 'object' || Array.isArray(section) || section === null) {
		dlogConfigWarnOptionalSectionSkippedWrongType(sectionKey, 'section', section);
		return parsedData;
	}

	dlogConfigSectionStart(sectionKey);

	for (const [key, value] of Object.entries(section)) {
		const resolvedKeys = resolveKeyFromAlias(keyAliases, key, sectionKey);
		const { fullGivenKey, resolvedKey } = resolvedKeys;

		switch (resolvedKey) {
			case 'minify': {
				if (typeof value !== 'boolean') {
					logConfigValueWrongType(fullGivenKey, 'boolean', value);
					break;
				}

				parsedData.transform.minify = value;
				vlogConfigValueLoaded(resolvedKeys, value);
				break;
			}
			case 'indentationSpaces': {
				if (typeof value !== 'number') {
					logConfigValueWrongType(fullGivenKey, 'number', value);
					break;
				}

				// TODO Check for invalid values

				parsedData.transform.indentationSpaces = value;
				vlogConfigValueLoaded(resolvedKeys, value);
				break;
			}
			case 'outputMode': {
				if (typeof value !== 'string') {
					logConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				parsedData = parseOutputModeFromString(value, resolvedKeys, parsedData);
				break;
			}
			default: {
				clogConfigKeyUnknown(fullGivenKey, parsedData);
			}
		}
	}

	dlogConfigSectionOk(sectionKey);

	return parsedData;
}

function parseOutputModeFromString(value: string, resolvedKeys: ResolvedYamlKey, parsedData: ConfigData): ConfigData {
	const { fullGivenKey } = resolvedKeys;
	const low = value.toLowerCase().trim();
	const modeFmtd = enumValue(value);

	const valueWasSet = (): void => vlogConfigValueLoaded(resolvedKeys, modeFmtd);
	const valueUnknown = (): void => logConfigValueUnknownWithSuggestions(fullGivenKey, value, Object.values(OutputMode));

	switch (low) {
		case 'combine':
			parsedData.transform.outputMode = OutputMode.Combine;
			valueWasSet();
			break;
		case 'spread':
			parsedData.transform.outputMode = OutputMode.Spread;
			valueWasSet()
			break;
		default:
			valueUnknown();
			break;
	}

	return parsedData;
}

export default parseTransformSection;
