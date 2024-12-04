import UserConfig from '../../../type/config/UserConfig';
import clr from 'chalk';
import { dlog } from '../../../utility/debug';
import { USER_CONFIG_FILENAME } from '../../load-data';
import { clog } from '../../../utility/console';
import { quote } from '../../../utility/string';
import { SB_ERR_SM, SB_ERR_LG } from '../../../utility/symbols';
import { clogConfWarn, dlogConfValueLoaded, resolveKeyFromAlias, YamlKeyAliases } from '../../../utility/config';

const keyAliases: YamlKeyAliases = {
    enabled: 'enabled',
    output: 'output',
    outputPath: 'output',
    outputFile: 'output',
    format: 'format'
}

async function parseLogsSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('logs'))
        dlog(clr.yellow(`User ${USER_CONFIG_FILENAME} is missing optional section "logs"`));

    const section = (data as Record<string, unknown>)['logs'];

    if (typeof section !== 'object' || section === null) {
        clog(` ${SB_ERR_LG} User ${USER_CONFIG_FILENAME} "logs" section is not a valid mapping`);
        return userConfig;
    }
    if (Array.isArray(section)) {
        clog(` ${SB_ERR_LG} User ${USER_CONFIG_FILENAME} "logs" section must be a mapping, not a list`);
        return userConfig;
    }

    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveKeyFromAlias(keyAliases, key);

        switch (resolved) {
            case 'enabled': {
                if (typeof value !== 'boolean') {
                    clog(` ${SB_ERR_SM} Value of key "logs.enabled" must be a boolean but was not: ${value}`);
                    break;
                }

                userConfig.logs.enabled = value;
                dlogConfValueLoaded('logs.enabled', value);
                break;
            }
            case 'output': {
                if (typeof value !== 'string') {
                    clog(` ${SB_ERR_SM} Value of key "logs.output" must be a string but was not: ${value}`);
                    break;
                }

                userConfig.logs.output = value;
                dlogConfValueLoaded('logs.output', value);
                break;
            }
            case 'format': {
                if (typeof value !== 'string') {
                    clog(` ${SB_ERR_SM} Value of key "logs.format" must be a string but was not: ${value}`);
                    break;
                }

                userConfig.logs.format = value;
                dlogConfValueLoaded('logs.format', value);
                break;
            }
            default: {
                const unknown = quote(`logs.${key}`);
                clogConfWarn(`Unknown key set at ${unknown}`);
            }
        }
    }

    return userConfig;
}

export default parseLogsSection;