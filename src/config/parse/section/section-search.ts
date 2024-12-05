import clr from 'chalk';

import { clog } from '../../../utility/console';
import { quote } from '../../../utility/string';
import { SB_ERR_LG, SB_OK_LG, SB_WARN } from '../../../utility/symbols'

import { USER_CONFIG_FILENAME } from '../../load-data';
import { makeManifests } from '../user-data';

import {
    dlogConfigSectionOk,
    dlogConfigValueLoaded,
    dlogConfigSectionStart,
    resolveKeyFromAlias,
    clogConfigFatalErrMissingRequiredSection,
    clogConfigFatalErrRequiredSectionWrongType,
    clogConfigValueWrongType,
    clogConfigValueUnknown
} from '../../../utility/config';
import UserConfig from '../../../type/config/UserConfig';
import ConfigKeyAliases from '../../../type/config/ConfigKeyAliases';
import ConfigKeyPair from '../../../type/config/ConfigKeyPair';
import Manifest from '../../../type/manifest/Manifest';

const sectionKey = 'search';
const keyAliases: ConfigKeyAliases = {
    directories: 'scanDirectories',
    recursively: 'scanRecursively',
    sources:     'manifests'
}

async function parseSearchSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes(sectionKey)) {
        clogConfigFatalErrMissingRequiredSection(sectionKey);
        process.exit();
    }

    const section = (data as Record<string, unknown>)[sectionKey];
    
    if (typeof section !== 'object' || Array.isArray(section) || section === null) {
        clogConfigFatalErrRequiredSectionWrongType(sectionKey, 'section', section);
        process.exit();
    }

    dlogConfigSectionStart(sectionKey);

    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveKeyFromAlias(keyAliases, key, sectionKey);
        const { fullGivenKey, resolvedKey } = resolved;

        switch (resolvedKey) {
            case 'scanDirectories': {
                if (typeof value !== 'boolean') {
                    clogConfigValueWrongType(fullGivenKey, 'boolean', value);
                    break;
                }

                userConfig.search.scanDirectories = value;
                dlogConfigValueLoaded(resolved, value);
                break;
            }
            case 'scanRecursively': {
                if (typeof value !== 'boolean') {
                    clogConfigValueWrongType(fullGivenKey, 'boolean', value);
                    break;
                }

                userConfig.search.scanRecursively = value;
                dlogConfigValueLoaded(resolved, value);
                break;
            }
            case `manifests`: {
                // TODO Maybe load manifests later, elsewhere
                // Maybe here we can just validate paths if needed, then have makeManifests in the UserConfig on demand?
                if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
                    if (!Array.isArray(value)) {
                        clogConfigValueWrongType(fullGivenKey, 'array of strings', value); // TODO Probably want a custom print here
                        // clog(` ${SB_ERR_LG} Value of config key "search.manifests" must be an array of strings but was not an array`);
                    } else {
                        clogConfigValueWrongType(fullGivenKey, 'array of strings', value);
                        clog(` ${SB_ERR_LG} Values inside array value of key "search.manifests" must all be strings, but at least one was a non-string`);
                    }
                }

                userConfig.search.manifests = await makeManifests(value, userConfig);
                dlogConfigValueLoaded(resolved, value);

                for (const manifest of userConfig.search.manifests) {
                    
                }

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

export default parseSearchSection;