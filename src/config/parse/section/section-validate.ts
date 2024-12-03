import clr from 'chalk';

import UserConfig from '../../../type/config/UserConfig.js';

async function parseValidateSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('validate'))
        throw new Error(clr.red('User Config is missing required section "search"'));
    
    return userConfig;
}

export default parseValidateSection;