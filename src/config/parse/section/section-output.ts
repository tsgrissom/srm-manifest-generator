import {
    clogConfigValueWrongType,
    dlogConfigWarnMissingOptionalSection,
    dlogConfigSectionStart,
    dlogConfigSectionOk,
    dlogConfigValueLoaded,
    resolveKeyFromAlias,
    dlogConfigWarnOptionalSectionSkippedWrongType,
    clogConfigValueUnknown
} from '../../../utility/config';

import UserConfig from '../../../type/config/UserConfig';
import ConfigKeyAliases from '../../../type/config/ConfigKeyAliases';

const sectionKey = 'output';
const keyAliases: ConfigKeyAliases = {
    minification: 'minify',
    indentationSpaces: 'indentSpaces',
    indentLevel: 'indentSpaces',
    outputMode: 'mode',
    spreadMode: 'mode'
}

async function parseOutputSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes(sectionKey)) {
        dlogConfigWarnMissingOptionalSection(sectionKey);
        return userConfig;
    }

    const section = (data as Record<string, unknown>)[sectionKey];

    if (typeof section !== 'object' || Array.isArray(section) || section === null) {
        dlogConfigWarnOptionalSectionSkippedWrongType(sectionKey, 'section', section);
        return userConfig;
    }

    dlogConfigSectionStart(sectionKey);
    
    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveKeyFromAlias(keyAliases, key, sectionKey);
        const { givenKey, fullGivenKey, resolvedKey, fullResolvedKey } = resolved;

        switch (resolvedKey) {
            case 'minify': {
                if (typeof value !== 'boolean') {
                    clogConfigValueWrongType(fullGivenKey, 'boolean', value);
                    break;
                }

                userConfig.output.minify = value;
                dlogConfigValueLoaded(resolved, value);
                break;
            }
            case 'indentSpaces': {
                if (typeof value !== 'number') {
                    clogConfigValueWrongType(fullGivenKey, 'number', value)
                    break;
                }

                userConfig.output.indentSpaces = value;
                dlogConfigValueLoaded(resolved, value);
                break;
            }
            case 'mode': {
                if (typeof value !== 'string') {
                    clogConfigValueWrongType(fullGivenKey, 'string', value);
                    break;
                }

                userConfig.output.mode = value;
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

export default parseOutputSection;