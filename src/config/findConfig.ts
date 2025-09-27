// steam-rom-manifester
// findConfig.ts
// 

import fsPromises from 'node:fs/promises';
import path from 'node:path';

import logger from '../util/file/logger';

async function isConfigFileInDir(dir: string): Promise<boolean> {
    const fpath = path.join(dir, 'config.yml');
    try {
        await fsPromises.access(fpath, fsPromises.constants.F_OK);
        logger.info(`A config file exists at "${fpath}"`);
        return true; 
    } catch {
        logger.info(`A config file does not exist at "${fpath}"`);
        return false;
    }
}

// MARK: Exports

export async function findConfig(): Promise<void> {
    logger.info('Finding config for steam-rom-manifester...')
    const args = process.argv
    if (args.length < 2) {
        logger.error(new Error('Could not find config, not enough args in process.argv'));
        return
    }
    const wd = args[1];
    logger.info(`Working dir: "${wd}"`);
    const isConfigInWd = await isConfigFileInDir(wd);
    logger.info(`Working dir has config file? ${isConfigInWd}`);
}