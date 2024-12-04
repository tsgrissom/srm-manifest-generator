import UserConfig from '../../../type/config/UserConfig.js';
import clr from 'chalk';
import { dlog } from '../../../utility/debug.js';
import { USER_CONFIG_FILENAME } from '../../load-data.js';
import { clog } from '../../../utility/console.js';
import { quote, SYMB_ERR_LG } from '../../../utility/string.js';
import { resolveKeyFromAlias, YamlKeyAliases } from '../../../utility/config.js';
import { clogConfWarn } from '../../config.js';

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
        clog(` ${SYMB_ERR_LG} User ${USER_CONFIG_FILENAME} "logs" section is not a valid mapping`);
        return userConfig;
    }
    if (Array.isArray(section)) {
        clog(` ${SYMB_ERR_LG} User ${USER_CONFIG_FILENAME} "logs" section must be a mapping, not a list`);
        return userConfig;
    }

    const resolveAlias = (key: string) : string => resolveKeyFromAlias(keyAliases, key);
    
    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveAlias(key);

        switch (resolved) {
            case 'enabled': {

                break;
            }
            case 'output': {

                break;
            }
            case 'format': {

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