import clr from 'chalk';

import { boolFmt } from '../../utility/boolean.js';
import { clog } from '../../utility/console.js';
import { delimitedList } from '../../utility/string.js';

import { dlogConfValueLoaded, clogConfBad, dlogConfInfo, clogConfWarn } from '../config.js';
import { USER_CONFIG_FILENAME } from '../load-data.js';
import { makeManifests } from './user-data.js';

import { UserConfig } from '../../type/config/UserConfig.js';

async function parseSearchSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('search'))
        throw new Error(clr.red('User Config is missing required section "search"'));

    const section = (data as Record<string, unknown>)['search'];
    
    if (typeof section !== 'object' || section === null)
        throw new Error(clr.red('User Config "search" section is not a valid object'));
    if (Array.isArray(section))
        throw new Error(clr.red('User Config "search" section must be a mapping, not a list (Expected object, Found array)'));

    const keyAliases: Record<string, string> = {
        directories: 'scanDirectories',
        recursively: 'scanRecursively',
        sources: 'manifests'
    }

    const resolveAlias = (key: string): string => {
        return keyAliases[key] || key;
    }

    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveAlias(key);

        switch (resolved) {
            case 'scanDirectories': {
                if (typeof value === 'boolean') {
                    // TEST Make sure values still changing when using resolved as switch
                    userConfig.search.scanDirectories = value;
                    dlogConfValueLoaded('search.scanDirectories', value)
                    // dlogConfInfo(chalk.magenta(`search.scanDirectories set=${boolFmt(manPaths)}`));
                } else {
                    clogConfBad(`Value of search.scanDirectories must be a boolean but was not: ${value}`);
                }
                break;
            }
            case 'scanRecursively': {
                if (typeof value === 'boolean') {
                    userConfig.search.scanRecursively = value;
                    // dlogConfigStatus(`search.scanRecursively set=${boolFmt(value)}`);
                    dlogConfInfo(clr.magenta(`search.scanRecursively set=${boolFmt(value)}`));
                } else {
                    clogConfBad(`Value of search.scanRecursively must be a boolean but was not: ${value}`);
                }
                break;
            }
            case `manifests`: {
                if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
                    const okManifests = await makeManifests(value, userConfig);

                    userConfig.search.manifests = okManifests;
                    dlogConfInfo(`search.manifests set=${delimitedList(value)}`);
                    dlogConfInfo(clr.magenta(`search.manifests set=${delimitedList(value)}`));
                    
                    if (okManifests.length === 0) {
                        clog(clr.yellow(`No manifest paths were loaded from the ${USER_CONFIG_FILENAME}`));
                    } else if (okManifests.length > 0) {
                        clog(clr.blue(`${okManifests.length} manifests were loaded from the ${USER_CONFIG_FILENAME}`));
                    } 
                } else {
                    if (!Array.isArray(value)) {
                        clogConfBad('Value of search.manifests must be array of strings but was not an array');
                    } else {
                        clogConfBad('All entries of search.manifests must be a string but at least one was not');
                    }
                }
                break;
            }
            default: {
                const unknownKey = `"search.${value}"`;
                clogConfWarn(`Unknown ${USER_CONFIG_FILENAME} key was set at ${unknownKey}`);
            }
        }
    }

    return userConfig;
}

export default parseSearchSection;