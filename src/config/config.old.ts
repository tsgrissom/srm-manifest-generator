// import fs from 'node:fs';

// import chalk from 'chalk';
// import yaml from 'yaml';

// import { dlog, dlogSectionWithData } from '../utility/logging.js';
// import { enabledDisabled } from '../utility/boolean.js';

// import {
//     USER_CONFIG_FILENAME,
//     USER_CONFIG_PATH,
//     loadUserConfigData
// } from './load-config.js';
// import { UserConfig } from '../type/UserConfig.js';
// import { Manifest } from '../type/Manifest.js';

// // MARK: HELPERS

// async function createManifestInstance(filePath: string, fileContents: string) {
//     // TODO Rewrite jsdoc to reflect removed fileName param

//     if (!filePath)
//         throw new Error(`Unable to create Manifest instance from invalid constructor arg filePath: "${filePath}"`);
//     if (filePath.trim() === '')
//         throw new Error(`Unable to create Manifest instance from empty constructor arg filePath: "${filePath}"`);

//     const object = yaml.parse(fileContents);
//     const manifest = new Manifest(filePath, object);
//     return manifest;
// }

// // MARK: Search Section
// {
//     const section = userConfigData.search;

//     if (section === null)
//         // logConfigErrorAndExit('Your config.yml "search" section cannot be empty');
    
//     if (!section)
//         // logConfigErrorAndExit('Your config.yml is missing the required section "search"');

//     const { manifests: allManifests } = section;

//     if (!allManifests) {
//         // logConfigErrorAndExit('Your config.yml is missing the required list of paths "manifests" within the section "search"');
//     }
    
//     const scanDirectories = section.scanDirectories ?? true;
//     const scanRecursively = section.scanRecursively || false;

//     // TODO: Implement options

//     const okManifests = [];

//     for (const manifest of allManifests) {
//         const { filePath } = manifest;

//         try {
//             const isPathValid = await verifyManifestPath(filePath, scanDirectories, scanRecursively);
            
//             if (!isPathValid) {
//                 logConfigWarn(`Path is not valid, skipped: ${filePath}`);
//                 continue;
//             }

//             const contents = await readManifestContents(filePath);
//             const instance = await createManifestInstance(filePath, contents);
            
//             okManifests.push(instance);
//         } catch (err) {
//             console.error(`Error processing manifest at ${filePath}:`, err);
//         }
//     }

//     userConfig.search.scanDirectories = scanDirectories;
//     userConfig.search.scanRecursively = scanRecursively; // TODO Update to scanRecursively
//     userConfig.search.manifests = okManifests;

//     const nOk = okManifests.length,
//           nAllPaths = allManifests.length;
    
//     let ctOk = `${nOk}/${nAllPaths}`;

//     if (nOk === nAllPaths) {
//         ctOk = chalk.green(ctOk);
//     } else if (nOk < nAllPaths) {
//         ctOk = chalk.red(ctOk);
//     }

//     logConfigStatus(`Loaded ${ctOk} configured manifest paths`);

//     dlogSectionWithData(
//         'User Config: Search section finished loading',
//         `Scan Directories? ${enabledDisabled(scanDirectories)}`,
//         `Scan Recursively? ${enabledDisabled(scanRecursively)}`,
//         chalk.blueBright('Manifest Paths')
//     );
// }

// // MARK: Output Section

// // MARK: Validation Section

// // MARK: Logging Section

// export default userConfig;