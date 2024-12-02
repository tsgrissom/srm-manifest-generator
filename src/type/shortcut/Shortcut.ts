import path from 'node:path';

import chalk from 'chalk';

import { clog } from '../../utility/console.js';

import ShortcutData from './ShortcutData.js';
import ShortcutOutput from './ShortcutOutput.js';
import ManifestData from '../manifest/ManifestData.js';
import Manifest from '../manifest/Manifest.js';

// TODO jsdoc
class Shortcut {

    // TODO jsdoc
    manifest: ManifestData;
    // TODO jsdoc
    data: ShortcutData;

    constructor(manifest: ManifestData, data: ShortcutData) {
        // TODO Accept config in constructor, check validity of executable
        // TODO Lint args

        if (!manifest)
            throw new Error(`Constructor arg "manifest" is invalid: ${manifest}`);
        if (!(manifest instanceof Manifest))
            throw new TypeError(`Constructor arg "manifest" is a non-Manifest type: ${manifest}`);

        if (!data)
            throw new Error(`Constructor arg "object" is invalid: ${data}`);
        if (typeof data !== 'object')
            throw new TypeError(`Constructor arg "object" must be a JavaScript object: ${data}`);
        if (Array.isArray(data))
            throw new TypeError(`Constructor arg "object" must be an object, not an array: ${data}`);

        this.manifest = manifest;
        this.data = data;

        if (process.argv.includes('--list-shortcuts')) {
            clog(chalk.blue('LOADED SHORTCUT'));
            clog(`Title: ${this.data.title}`);
            clog(`Target: ${this.data.target}`);
            clog(`Enabled: ${this.data.enabled}`);
        }
    }

    /**
     * Maps the Shortcut instance's attributes to a JavaScript object
     * which is compatible for writing to a JSON manifest for Steam
     * ROM Manager.
     * @returns {object} The JSON designed for handling by Steam ROM Manager.
     */
    getWritableObject() : ShortcutOutput {
        return {
            title: this.getTitle(),
            target: this.getFullTargetPath()
        };
    }

    getTitle() : string {
        return this.data.title;
    }

    getRelativeTargetPath() : string {
        return this.data.target;
    }

    getFullTargetPath() : string {
        const rootDir = this.manifest.rootDirectory;

        if (!rootDir) // TODO Rewrite this error
            throw new Error(`Error while constructing full target path for Shortcut (${this.getTitle()}): Manifest (${this.manifest.name}) root directory was invalid`);

        return path.join(this.manifest.rootDirectory, this.getRelativeTargetPath());
    }

    isEnabled() : boolean {
        return !this.data.enabled;
    }

    isDisabled() : boolean {
        return !this.isEnabled();
    }

    // TODO
    async doesTargetFileExist() {

    }

    // TODO
    async isTargetFileValidExecutable() {

    }
}

export default Shortcut;