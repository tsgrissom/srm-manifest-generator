import UserConfig from '../../../type/config/UserConfig.js';
import clr from 'chalk';
import { dlog } from '../../../utility/debug.js';
import { USER_CONFIG_FILENAME } from '../../load-data.js';
import { clog } from '../../../utility/console.js';
import { quote, SB_ERR_LG, SB_ERR_SM } from '../../../utility/string.js';
import { clogConfWarn, dlogConfValueLoaded, resolveKeyFromAlias, YamlKeyAliases } from '../../../utility/config.js';

const keyAliases: YamlKeyAliases = {
    filePaths: 'filePaths',
    paths: 'filePaths',
    executables: 'executables',
    exes: 'executables',
    executableExtensions: 'executableExtensions',
    acceptedExecutables: 'executableExtensions'
}

async function parseValidateSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('validate'))
        dlog(clr.yellow(`User ${USER_CONFIG_FILENAME} is missing optional section "validate"`));
    
    const section = (data as Record<string, unknown>)['validate'];

    if (typeof section !== 'object' || section === null) {
        clog(` ${SB_ERR_LG} User ${USER_CONFIG_FILENAME} "validate" section is not a valid mapping`);
        return userConfig;
    }
    
    if (Array.isArray(section)) {
        clog(` ${SB_ERR_LG} User ${USER_CONFIG_FILENAME} "validate" section must be a mapping, not a list`);
        return userConfig;
    }
    
    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveKeyFromAlias(keyAliases, key);

        switch (resolved) {
            case 'filePaths': {
                if (typeof value !== 'boolean') {
                    clog(` ${SB_ERR_SM} Value of key "validate.filePaths" must be a boolean but was not: ${value}`);
                    break;
                }

                userConfig.validate.filePaths = value;
                dlogConfValueLoaded('validate.filePaths', value);
                break;
            }
            case 'executables': {
                if (typeof value !== 'boolean') {
                    clog(` ${SB_ERR_SM} Value of key "validate.executables" must be a boolean but was not: ${value}`);
                    break;
                }

                userConfig.validate.executables = value;
                dlogConfValueLoaded('validate.executables', value);
                break;
            }
            case 'executableExtensions': {
                if (typeof value !== 'object' || (!Array.isArray(value) && typeof value !== 'string')) {
                    clog(` ${SB_ERR_SM} Value of key "validate.executableExtensions" must be a string or array of strings but was not: ${value}`);
                    break;
                }

                let normalized: string[];

                if (typeof value === 'string')
                    normalized = [value];
                else if (typeof value === 'object' && Array.isArray(value))
                    normalized = value;
                else
                    throw new TypeError(`Unexpected: Could not convert config value "validate.executableExtensions" into an array`);

                userConfig.validate.executableExtensions = normalized;
                dlogConfValueLoaded('validate.executableExtensions', normalized);
                break;
            }
            default: {
                const unknown = quote(`validate.${key}`);
                clogConfWarn(`Unknown key set at ${unknown}`);
            }
        }
    }

    // TODO
    
    return userConfig;
}

export default parseValidateSection;