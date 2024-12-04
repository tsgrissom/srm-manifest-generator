import clr from 'chalk';

import { clog } from '../../../utility/console.js';
import { quote, SB_ERR_LG, SB_ERR_SM, SB_OK_LG, SB_WARN } from '../../../utility/string.js';

import { USER_CONFIG_FILENAME } from '../../load-data.js';
import { makeManifests } from '../user-data.js';

import {
    clogConfInvalid,
    clogConfWarn,
    dlogConfValueLoaded,
    resolveKeyFromAlias,
    YamlKeyAliases
} from '../../../utility/config.js';
import UserConfig from '../../../type/config/UserConfig.js';

const keyAliases: YamlKeyAliases = {
    directories: 'scanDirectories',
    recursively: 'scanRecursively',
    sources:     'manifests'
}

async function parseSearchSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('search'))
        throw new Error(clr.red(`User ${USER_CONFIG_FILENAME} is missing required section "search"`));

    const section = (data as Record<string, unknown>)['search'];
    
    if (typeof section !== 'object' || section === null)
        throw new Error(clr.red('User Config "search" section is not a valid mapping'));
    if (Array.isArray(section))
        throw new Error(clr.red('User Config "search" section must be a mapping, not a list'));

    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveKeyFromAlias(keyAliases, key);

        switch (resolved) {
            case 'scanDirectories': {
                if (typeof value !== 'boolean') {
                    clog(` ${SB_ERR_SM} Value of key "search.scanDirectories" must be a boolean but was not: ${value}`);
                    break;
                }

                userConfig.search.scanDirectories = value;
                dlogConfValueLoaded('search.scanDirectories', value);
                break;
            }
            case 'scanRecursively': {
                if (typeof value !== 'boolean') {
                    clog(` ${SB_ERR_SM} Value of key "search.scanRecursively" must be a boolean but was not: ${value}`);
                    break;
                }

                userConfig.search.scanRecursively = value;
                dlogConfValueLoaded('search.scanRecursively', value);
                break;
            }
            case `manifests`: {
                // TODO Check for rewrite
                if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
                    const okManifests = await makeManifests(value, userConfig);

                    userConfig.search.manifests = okManifests;
                    // dlogConfInfo(`search.manifests set=${delimitedList(value)}`);
                    dlogConfValueLoaded('search.manifests', value);
                    
                    const nAll = value.length;
                    const nOk  = okManifests.length;
                    const ratio = `(${nOk}/${nAll})`;

                    if (nOk === 0) {
                        const postfix = nAll > 0 ? clr.red(ratio) : '';
                        clog(`${SB_ERR_LG} No manifest paths were loaded from the ${USER_CONFIG_FILENAME} ${postfix}`);
                        // TODO Debug log here
                    } else if (okManifests.length > 0) {
                        // clog(clr.blue(`${okManifests.length} manifests were loaded from the ${USER_CONFIG_FILENAME}`));
                        
                        let prefix = '',
                            blob = '',
                            postfix = '';
                        if (nAll === nOk) {
                            if (nAll > 0) {
                                prefix = SB_OK_LG;
                                blob = 'All configured manifest paths were loaded';
                                postfix = clr.greenBright(ratio);
                            } else if (nAll === 0) {
                                prefix = SB_ERR_LG;
                                blob = 'None of the configured manifest paths were loaded';
                            }
                        } else if (nAll > nOk) {
                            prefix = SB_WARN;
                            blob = 'Some but not all configured manifest paths were loaded';
                            postfix = clr.yellowBright(ratio);
                        } else {
                            throw new Error(`Unexpected: nAll < nOk`);
                        }

                        clog(`${prefix} ${blob} ${postfix}`);
                    } 
                } else {
                    if (!Array.isArray(value)) {
                        clogConfInvalid('Value of search.manifests must be array of strings but was not an array');
                    } else {
                        clogConfInvalid('All entries of search.manifests must be a string but at least one was not');
                    }
                }
                break;
            }
            default: {
                const unknown = quote(`search.${key}`);
                clogConfWarn(`Unknown key set at ${unknown}`);
            }
        }
    }

    return userConfig;
}

export default parseSearchSection;