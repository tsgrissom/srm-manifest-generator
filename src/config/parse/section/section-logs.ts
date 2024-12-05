import {
    clogConfigValueWrongType,
    clogConfigValueUnknown,
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
    enabled: 'enabled',
    output: 'output',
    outputPath: 'output',
    outputFile: 'output',
    format: 'format'
}

async function parseLogsSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
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
        const { fullGivenKey, resolvedKey } = resolved;

        switch (resolvedKey) {
            case 'enabled': {
                if (typeof value !== 'boolean') {
                    clogConfigValueWrongType(fullGivenKey, 'boolean', value);
                    break;
                }

                userConfig.logs.enabled = value;
                dlogConfigValueLoaded(resolved, value);
                break;
            }
            case 'output': {
                if (typeof value !== 'string') {
                    clogConfigValueWrongType(fullGivenKey, 'string', value);
                    break;
                }

                userConfig.logs.output = value;
                dlogConfigValueLoaded(resolved, value);
                break;
            }
            case 'format': {
                if (typeof value !== 'string') {
                    clogConfigValueWrongType(fullGivenKey, 'string', value);
                    break;
                }

                userConfig.logs.format = value;
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

export default parseLogsSection;