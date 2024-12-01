import path from 'node:path';

import chalk from 'chalk';
import { basenameWithoutExtensions } from '../utility/file.js';
import { Manifest } from './Manifest.js';

export interface ShortcutOutput {
    title: string,
    target: string
}

export interface ShortcutData extends ShortcutOutput {
    title: string;
    target: string;
    enabled: boolean;
}

export class Shortcut {

    manifest: Manifest;
    data: ShortcutData;

    constructor(manifest: Manifest, data: ShortcutData) {
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
            console.log(chalk.blue('LOADED SHORTCUT'));
            console.log(`Title: ${this.data.title}`);
            console.log(`Target: ${this.data.target}`);
            console.log(`Enabled: ${this.data.enabled}`);
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
        const rootDir = this.manifest.getRootDirectory();

        if (!rootDir)
            throw new Error(`Error while constructing full target path for Shortcut (${this.getTitle()}): Manifest (${this.manifest.getName()}) root directory was invalid`);

        return path.join(this.manifest.getRootDirectory(), this.getRelativeTargetPath());
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