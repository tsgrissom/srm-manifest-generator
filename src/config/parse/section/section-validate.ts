import { quote } from '../../../utility/string';
import {
    dlogConfigSectionOk,
    dlogConfigWarnOptionalSectionSkippedWrongType,
    dlogConfigSectionStart,
    dlogConfigValueLoaded,
    dlogConfigWarnMissingOptionalSection,
    resolveKeyFromAlias,
    clogConfigValueWrongType,
    clogConfigValueUnknown
} from '../../../utility/config';

import UserConfig from '../../../type/config/UserConfig';
import ConfigKeyAliases from '../../../type/config/ConfigKeyAliases';

const sectionKey = 'validate';
const keyAliases: ConfigKeyAliases = {
    filePaths: 'filePaths',
    paths: 'filePaths',
    executables: 'executables',
    exes: 'executables',
    executableExtensions: 'executableExtensions',
    acceptedExecutables: 'executableExtensions'
}

async function parseValidateSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
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
            case 'filePaths': {
                if (typeof value !== 'boolean') {
                    clogConfigValueWrongType(fullGivenKey, 'boolean', value);
                    break;
                }

                userConfig.validate.filePaths = value;
                dlogConfigValueLoaded(resolved, value);
                break;
            }
            case 'executables': {
                if (typeof value !== 'boolean') {
                    clogConfigValueWrongType(fullGivenKey, 'boolean', value);
                    break;
                }

                userConfig.validate.executables = value;
                dlogConfigValueLoaded(resolved, value);
                break;
            }
            case 'executableExtensions': {
                if (typeof value !== 'object' || (!Array.isArray(value) && typeof value !== 'string')) {
                    clogConfigValueWrongType(fullGivenKey, 'string or array of strings', value); // TOOD Check each entry inside array too
                    break;
                }

                let normalized: string[];

                if (typeof value === 'string')
                    normalized = [value];
                else if (typeof value === 'object' && Array.isArray(value))
                    normalized = value;
                else
                    throw new TypeError(`Unexpected: Could not convert config value ${quote(fullGivenKey)} into an array`);

                userConfig.validate.executableExtensions = normalized;
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

export default parseValidateSection;