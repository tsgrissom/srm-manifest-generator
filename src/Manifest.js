import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import YAML from 'yaml';
import { logDebug } from './utilities.js';

class Manifest {

    // TODO Rewrite to be constructed from JSON object arg
    constructor(filePath) {
        this.filePath = filePath;

        if (!fs.existsSync(filePath)) {
            logDebug(chalk.yellow(`WARN: Manifest object created from non-existent file: "${filePath}"`, false, false));
        } else {
            const stats = fs.statSync(filePath);
            // TODO: Write unit test
            if (!stats.isFile()) {
                throw new Error(`Unable to create Manifest from non-file: "${filePath}"`);
            }
        }
    }

    async doesFileExist() {
        let fileHandle;
        let fileExists;
        
        try {
            fileHandle = await fs.promises.open(this.filePath, 'r');
            fileExists = true;
        } catch {
            fileExists = false;
        } finally {
            if (fileHandle) {
                await fileHandle.close();
            }
        }

        return fileExists;
    }

    async getFileContents() {
        const fileExists = await this.doesFileExist();

        if (!fileExists) {
            throw new Error(`Could not find the referenced file: "${this.filePath}"`);
        }

        const fileContents = await fs.promises.readFile(this.filePath, 'utf8');
        return fileContents;
    }

    async getObject() {
        const fileContents = await this.getFileContents(); // Assumed to be YAML file
        return YAML.parse(fileContents);
    }

    async getNameOfFile() {
        const fileExists = await this.doesFileExist();

        if (!fileExists) {
            throw new Error(`Unable to getNameOfFile for non-existent file: "${this.filePath}"`);
        }

        const name = path.basename(this.filePath);
        return name;
    }

    // TODO: Write tests
    async hasNameAttribute() {
        const fileExists = await this.doesFileExist();

        if (!fileExists) {
            throw new Error(`Unable to check if hasNameAttribute for non-existent file: "${this.filePath}"`);
        }

        const data = await this.getObject();

        if (data === null) {
            return false;
        }

        const { name } = data;

        if (name === null) {
            return false;
        }

        if (typeof(name) !== 'string') {
            return false;
        }

        if (name.trim() === '') {
            return false;
        }

        return true;
    }

    // TODO: Write tests
    async getNameAttribute() {
        let hasInnerName;
        
        try {
            hasInnerName = await this.hasNameAttribute();
        } catch (error) {
            throw new Error(error);
        }

        if (!hasInnerName) {
            return null;
        }

        const data = await this.getObject();
        return data.name;
    }

    async getName() {
        const fileExists = await this.doesFileExist();

        if (!fileExists) {
            throw new Error(`Unable to getSourceName for non-existent file: "${this.filePath}"`);
        }

        const nameOfFile = await this.getNameOfFile();
        const nameAttribute = await this.getNameAttribute();

        let name = nameOfFile;

        if (nameAttribute !== null) {
            name = nameAttribute;
        }

        return name;
    }

    async getOutputPath() {
        const fileExists = await this.doesFileExist();

        if (!fileExists) {
            throw new Error(`Unable to getRootDirectory for non-existent file: "${this.filePath}"`);
        }

        const data = await this.getObject();

        if (data.output) {
            return data.output;
        } else {
            return null;
        }
    }

    async getRootDirectory() {
        const fileExists = await this.doesFileExist();

        if (!fileExists) {
            throw new Error(`Unable to getRootDirectory for non-existent file: "${this.filePath}"`);
        }

        const data = await this.getObject();

        if (data.root) {
            return data.root;
        } else if (data.entries) {
            return data.entries;
        } else {
            throw new Error(`Could not find root directory for Manifest: ${this.name}`);
        }
    }

    /**
     * Finds the value of the shortcuts attribute for the current Manifest.
     * @returns The value of YAML keys shortcuts,entries, otherwise returns an empty array.
     */
    async getShortcuts() {
        const fileExists = await this.doesFileExist();

        if (!fileExists) {
            throw new Error(`Unable to getShortcuts for non-existent file: "${this.filePath}"`);
        }

        const data = await this.getObject();

        // TODO "titles" as an alias?
        if (data.entries) {
            return data.entries;
        } else if (data.shortcuts) {
            return data.shortcuts;
        } else {
            return [];
        }
    }

    async isShortcutsAnArray() {
        try {
            const shortcuts = await this.getShortcuts();
            return Array.isArray(shortcuts);
        } catch {
            return false;
        }
    }

    async isShortcutsEmpty() {
        const shortcuts = await this.getShortcuts();
        if (this.isShortcutsAnArray()) {
            return shortcuts.length === 0;
        } else {
            return shortcuts.trim() === '';
        }
    }

    async isShortcutsNotEmpty() {
        const isEmpty = await this.isShortcutsEmpty();
        return !isEmpty; 
    }

    async getEnabledShortcuts() {
        const shortcuts = await this.getShortcuts();

        return shortcuts.filter(sc => {
            // enabled defaults to true, disabled defaults to false
            // TEST for anticipated behavior for both enabled + disabled
            // TEST edge case of contradiction
            // TODO Move logic to method of a class
            const {enabled, disabled} = sc;
    
            if (disabled || enabled === false) {
                return false;
            }
    
            return enabled !== false;
        });
    }
}

export default Manifest;