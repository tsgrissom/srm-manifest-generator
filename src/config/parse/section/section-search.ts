import clr from 'chalk';

import { fmtBool } from '../../../utility/boolean.js';
import { clog } from '../../../utility/console.js';
import { delimitedList, quote } from '../../../utility/string.js';

import { dlogConfValueLoaded, clogConfInvalid, dlogConfInfo, clogConfWarn } from '../../config.js';
import { USER_CONFIG_FILENAME } from '../../load-data.js';
import { makeManifests } from '../user-data.js';

import { resolveKeyFromAlias, YamlKeyAliases } from '../../../utility/config.js';
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

    const resolveAlias = (key: string) : string => resolveKeyFromAlias(keyAliases, key);

    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveAlias(key);

        switch (resolved) {
            case 'scanDirectories': {
                if (typeof value === 'boolean') {
                    // TEST Make sure values still changing when using resolved as switch
                    userConfig.search.scanDirectories = value;
                    dlogConfValueLoaded('search.scanDirectories', value)
                } else {
                    clogConfInvalid(`Value of search.scanDirectories must be a boolean but was not: ${value}`);
                }
                break;
            }
            case 'scanRecursively': {
                if (typeof value === 'boolean') {
                    userConfig.search.scanRecursively = value;
                    dlogConfValueLoaded('search.scanRecursively', value);
                } else {
                    clogConfInvalid(`Value of search.scanRecursively must be a boolean but was not: ${value}`);
                }
                break;
            }
            case `manifests`: {
                if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
                    const okManifests = await makeManifests(value, userConfig);

                    userConfig.search.manifests = okManifests;
                    dlogConfInfo(`search.manifests set=${delimitedList(value)}`);
                    
                    if (okManifests.length === 0) {
                        clog(clr.yellow(`No manifest paths were loaded from the ${USER_CONFIG_FILENAME}`));
                    } else if (okManifests.length > 0) {
                        clog(clr.blue(`${okManifests.length} manifests were loaded from the ${USER_CONFIG_FILENAME}`));
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