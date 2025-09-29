// steam-rom-manifester
// findConfig.ts
// 

import fsPromises from 'node:fs/promises';
import path from 'node:path';

import logger from '../util/file/logger';

import { yesNo } from '../util/string/format';

const CONF_FILENAME = 'config.yml';
const CONF_DIRNAME = 'config';

/**
 * Checks if an existing, accessible "config.yml" file exists in the given directory.
 * @param dir The directory to check.
 * @returns A Promise resolving to a boolean value indicating whether an existing,
 *  accessible config file exists in the given directory.
 */
async function isAccessibleConfigFileInDirectory(dir: string): Promise<boolean> {
    const fpath = path.join(dir, CONF_FILENAME);
    try {
        await fsPromises.access(fpath, fsPromises.constants.F_OK);
        logger.info(`A config file exists at "${fpath}"`);
        return true; 
    } catch {
        logger.info(`A config file does not exist at "${fpath}"`);
        return false;
    }
}

async function getConfigFileInWorkingDirectory(): Promise<string | null> {
    logger.info('Checking for config in the working dir...');
    const args = process.argv;
    if (args.length < 2) {
        logger.error(new Error(`Failed to determine working directory, not enough args in process.argv`));
        return null;
    }
    const wd = args[1];
    logger.info(`Working dir: "${wd}"`);
    const isConfigInWd = await isAccessibleConfigFileInDirectory(wd);
    logger.info(`Config file in working dir: ${yesNo(isConfigInWd)}`)
    if (!isConfigInWd) { return null }
    const fpath = path.join(wd, CONF_FILENAME);
    return await fsPromises.readFile(fpath, 'utf-8');
}

// MARK: Exports

export async function findConfig(): Promise<string | null> {
    logger.info('Finding config for steam-rom-manifester...')
    const configInWd = await getConfigFileInWorkingDirectory();
    logger.info(`Config in working dir: ${configInWd == null ? 'None' : configInWd}`);
    return configInWd;
}