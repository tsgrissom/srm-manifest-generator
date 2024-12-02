import clr from 'chalk';

import { UserConfig } from '../../type/config/UserConfig.js';

async function parseOutputSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('output'))
        throw new Error(clr.red('User Config is missing required section "search"'));

    return userConfig;
}

export default parseOutputSection;