import path from 'node:path';

import chalk from "chalk";
import { basenameWithoutExtensions } from './file-utilities.js';
import { logDebugSectionWithData } from './utilities.js';
import { yesNo } from './string-utilities.js';

class Shortcut {

    constructor(manifest, object) {
        // TODO Accept config in constructor, check validity of executable
        // TODO Lint args

        if (!manifest)
            throw new Error('Constructor argument manifest is invalid');
        if (!object) {
            throw new Error('Constructor argument object is invalid');
        }

        this.manifest = manifest;
        this.object = object;

        // Validate params

        // MARK: PARSING

        const parsedValues = {
            title: undefined,
            target: undefined,
            enabled: true
        };

        // MARK: Parse target
        {
            for (const value of [object.target, object.exec]) {
                if (value && value.trim() !== '') {
                    parsedValues.target = value;
                }
            }
        }

        if (!parsedValues.target) {
            throw new Error('Could not find required attribute "target" or any of its aliases within the given object');
        }

        this.target = parsedValues.target;


        // MARK: Parse title
        {
            for (const value of [object.title, object.name]) {
                if (value && value.trim() !== '') {
                    parsedValues.title = value;
                }
            }

            if (!parsedValues.title) {
                const fileName = basenameWithoutExtensions(this.manifest.fileName);
                
                if (!fileName)
                    throw new Error(`Unable to infer a name for Shortcut at the following target: ${parsedValues.target}`);

                parsedValues.title = fileName; // TODO TEST This
            }
        }

        this.title = parsedValues.title;

        // MARK: Parse enabled
        {
            if (object.enabled !== undefined && !object.enabled) {
                parsedValues.enabled = false;
            }
    
            if (object.disabled !== undefined && object.disabled) {
                parsedValues.enabled = false;
            }

            if (object.disabled !== undefined && object.enabled !== undefined) {
                console.warn(chalk.yellow(`WARN: Properties "disabled" and "enabled" were found in a Shortcut at the same time which can cause issues. You probably want to remove one.`));
            }
        }

        this.enabled = parsedValues.enabled;

        // MARK: PARSING END

        if (process.argv.includes('--list-shortcuts')) {
            console.log(chalk.blue('LOADED SHORTCUT'));
            console.log(`Title: ${this.title}`);
            console.log(`Target: ${this.target}`);
            console.log(`Enabled: ${this.enabled}`);
        }
    }

    /**
     * Maps the Shortcut instance's attributes to a JavaScript object
     * which is compatible for writing to a JSON manifest for Steam
     * ROM Manager.
     * @returns {object} The JSON designed for handling by Steam ROM Manager.
     */
    getWritableObject() {
        return {
            title: this.getTitle(),
            target: this.getFullTargetPath()
        };
    }

    getTitle() {
        return this.title;
    }

    getRelativeTargetPath() {
        return this.target;
    }

    getFullTargetPath() {
        const rootDir = this.manifest.getRootDirectory();

        if (!rootDir)
            throw new Error(`Error while constructing full target path for Shortcut (${this.getTitle()}): Manifest (${this.manifest.getName()}) root directory was invalid`);

        return path.join(this.manifest.getRootDirectory(), this.getRelativeTargetPath());
    }

    isEnabled() {
        return !this.enabled;
    }

    isDisabled() {
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