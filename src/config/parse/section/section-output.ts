import clr from 'chalk';

import UserConfig from '../../../type/config/UserConfig.js';
import chalk from 'chalk';
import { dlog } from '../../../utility/debug.js';
import { USER_CONFIG_FILENAME } from '../../load-data.js';
import { resolveKeyFromAlias, YamlKeyAliases } from '../../../utility/config.js';
import { clog } from '../../../utility/console.js';
import { quote, SYMB_ERR_LG } from '../../../utility/string.js';
import { clogConfWarn } from '../../config.js';

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
        clog(` ${SYMB_ERR_LG} User ${USER_CONFIG_FILENAME} "output" section is not a valid mapping`);
        return userConfig;
    }
    if (Array.isArray(section)) {
        clog(` ${SYMB_ERR_LG} User ${USER_CONFIG_FILENAME} "output" section must be a mapping, not a list`);
        return userConfig;
    }

    const resolveAlias = (key: string) : string => resolveKeyFromAlias(keyAliases, key);
    
    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveAlias(key);

        switch (resolved) {
            case 'minify': {

                break;
            }
            case 'indentSpaces': {

                break;
            }
            case 'mode': {

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