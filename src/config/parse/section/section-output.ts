import clr from 'chalk';

import UserConfig from '../../../type/config/UserConfig.js';
import chalk from 'chalk';
import { dlog } from '../../../utility/debug.js';
import { USER_CONFIG_FILENAME } from '../../load-data.js';
import { resolveKeyFromAlias, YamlKeyAliases } from '../../../utility/config.js';
import { clog } from '../../../utility/console.js';
import { quote, SB_ERR_LG, SB_ERR_SM } from '../../../utility/string.js';
import { clogConfWarn, dlogConfValueLoaded } from '../../config.js';

const keyAliases: YamlKeyAliases = {
    minify: 'minify',
    indentSpaces: 'indentSpaces',
    indentationSpaces: 'indentSpaces',
    mode: 'mode',
    outputMode: 'mode'
}

async function parseOutputSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('output'))
        dlog(chalk.yellow(`User ${USER_CONFIG_FILENAME} is missing optional section "output"`));

    const section = (data as Record<string, unknown>)['output'];

    if (typeof section !== 'object' || section === null) {
        clog(` ${SB_ERR_LG} User ${USER_CONFIG_FILENAME} "output" section is not a valid mapping`);
        return userConfig;
    }
    if (Array.isArray(section)) {
        clog(` ${SB_ERR_LG} User ${USER_CONFIG_FILENAME} "output" section must be a mapping, not a list`);
        return userConfig;
    }
    
    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveKeyFromAlias(keyAliases, key);

        switch (resolved) {
            case 'minify': {
                if (typeof value !== 'boolean') {
                    clog(` ${SB_ERR_SM} Value of key "output.minify" must be a boolean but was not: ${value}`);
                    break;
                }

                userConfig.output.minify = value;
                dlogConfValueLoaded('output.minify', value);
                break;
            }
            case 'indentSpaces': {
                if (typeof value !== 'number') {
                    clog(` ${SB_ERR_SM} Value of key "output.indentSpaces" must be a number but was not: ${value}`);
                    break;
                }

                userConfig.output.indentSpaces = value;
                dlogConfValueLoaded('output.indentSpaces', value);
                break;
            }
            case 'mode': {
                if (typeof value !== 'string') {
                    clog(` ${SB_ERR_SM} Value of key "output.mode" must be a string but was not: ${value}`);
                    break;
                }

                userConfig.output.mode = value;
                dlogConfValueLoaded('output.mode', value);
                break;
            }
            default: {
                const unknown = quote(`output.${key}`);
                clogConfWarn(`Unknown key set at ${unknown}`);
            }
        }
    }

    return userConfig;
}

export default parseOutputSection;