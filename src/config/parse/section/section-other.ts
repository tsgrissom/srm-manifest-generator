import clr from 'chalk';

import UserConfig from '../../../type/config/UserConfig.js';
import { resolveKeyFromAlias, YamlKeyAliases } from '../../../utility/config.js';
import { USER_CONFIG_FILENAME } from '../../load-data.js';
import { dlog } from '../../../utility/debug.js';
import chalk from 'chalk';
import { clog } from '../../../utility/console.js';
import { quote, SYMB_ERR_LG, SYMB_ERR_SM } from '../../../utility/string.js';
import { clogConfWarn, dlogConfValueLoaded } from '../../config.js';

const keyAliases: YamlKeyAliases = {
    useColor: 'useColor',
    debug: 'debug',
    debugging: 'debug',
    verbose: 'verbose',
    verbosity: 'verbose'
}

async function parseOtherSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('other')) {
        dlog(chalk.yellow(`User ${USER_CONFIG_FILENAME} is missing optional section "other"`));
    }

    const section = (data as Record<string, unknown>)['other'];

    if (typeof section !== 'object' || section === null) {
        clog(` ${SYMB_ERR_LG} User ${USER_CONFIG_FILENAME} "other" section is not a valid mapping`);
        return userConfig;
    }
    if (Array.isArray(section)) {
        clog(` ${SYMB_ERR_LG} User ${USER_CONFIG_FILENAME} "other" section must be a mapping, not a list`);
        return userConfig;
    }

    const resolveAlias = (key: string) : string => resolveKeyFromAlias(keyAliases, key);

    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveAlias(key);

        switch (resolved) {
            case 'debug': {
                if (typeof value !== 'boolean') {
                    clog(` ${SYMB_ERR_SM} Value of key "other.debug" must be a boolean but was not: ${value}`);
                    break;
                }

                userConfig.other.debug = value;
                dlogConfValueLoaded('other.debug', value);
                break;
            }
            case 'useColor': {
                if (typeof value !== 'boolean') {
                    clog(` ${SYMB_ERR_SM} Value of key "other.useColor" must be a boolean but was not: ${value}`);
                    break;
                }
                
                userConfig.other.useColor = value;
                dlogConfValueLoaded('other.useColor', value);
                break;
            }
            case 'verbose': {
                if (typeof value !== 'boolean') {
                    clog(` ${SYMB_ERR_SM} Value of key "other.verbose" must be a boolean but was not: ${value}`);
                    break;
                }
                
                userConfig.other.verbose = value;
                dlogConfValueLoaded('other.verbose', value);
                break;
            }
            default: {
                const unknown = quote(`other.${key}`);
                clogConfWarn(`Unknown key set at ${unknown}`);
            }
        }
    }

    return userConfig;
}

export default parseOtherSection;