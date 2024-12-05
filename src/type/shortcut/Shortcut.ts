import path from 'node:path';

import clr from 'chalk';

import { clog } from '../../utility/console.js';

import ShortcutData from './ShortcutData.js';
import ShortcutExportData from './ShortcutExportData.js';
import ManifestData from '../manifest/ManifestData.js';
import Manifest from '../manifest/Manifest.js';
import { isDebugActive } from '../../utility/debug.js';
import { quote } from '../../utility/string.js';
import { fmtBool } from '../../utility/boolean.js';

// TODO jsdoc
class Shortcut implements ShortcutData {

    // TODO jsdoc
    manifest: ManifestData;
    
    title: string;
    target: string;
    enabled: boolean;

    constructor(manifest: ManifestData, data: ShortcutData) {
        // TODO Accept config in constructor, check validity of executable
        // TODO Lint args

        if (!data)
            throw new Error(`Constructor arg "object" is invalid: ${data}`);
        if (typeof data !== 'object')
            throw new TypeError(`Constructor arg "object" must be a JavaScript object: ${data}`);
        if (Array.isArray(data))
            throw new TypeError(`Constructor arg "object" must be an object, not an array: ${data}`);

        this.manifest = manifest;
        this.title = data.title;
        this.target = data.target;
        this.enabled = data.enabled;

        if (process.argv.includes('--list-shortcuts') || isDebugActive()) { // TODO Take off debug, move to verbose once shortcuts are working
            clog(clr.blue.underline(`LOADED SHORTCUT: ${quote(this.title)}`));
            clog(` Title: ${quote(this.title)}`);
            clog(` Target: ${quote(this.target)}`);
            clog(` Enabled: ${fmtBool(this.enabled)}`);
        }
    }

    /**
     * Maps the Shortcut instance's attributes to a JavaScript object
     * which is compatible for writing to a JSON manifest for Steam
     * ROM Manager.
     * @returns The JSON designed for handling by Steam ROM Manager.
     */
    public getExportData() : ShortcutExportData {
        clog(clr.bgRed(`getExportData called`), `this.title: ${this.getTitle()}`, `this.target: ${this.getFullTargetPath()}`);

        return {
            title: this.getTitle(),
            target: this.getFullTargetPath()
        };
    }

    getTitle() : string {
        return this.title;
    }

    getRelativeTargetPath() : string {
        return this.target;
    }

    getFullTargetPath() : string {
        const rootDir = this.manifest.baseDirectory;

        if (!rootDir) // TODO Rewrite this error
            throw new Error(`Error while constructing full target path for Shortcut (${this.getTitle()}): Manifest (${this.manifest.sourceName}) root directory was invalid`);

        return path.join(this.manifest.baseDirectory, this.getRelativeTargetPath());
    }

    isEnabled() : boolean {
        return this.enabled;
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