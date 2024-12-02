import clr from 'chalk';

import { UserConfig } from '../../type/config/UserConfig';

async function parseLogsSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    if (!Object.keys(data).includes('logs'))
        throw new Error(clr.red('User Config is missing required section "search"'));

    return userConfig;
}

export default parseLogsSection;