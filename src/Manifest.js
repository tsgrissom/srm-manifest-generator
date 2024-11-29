import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import YAML from 'yaml';
import { getFileBasenameWithoutExtensions, logDebug } from './utilities.js';

import Shortcut from './Shortcut.js';

class Manifest {

    /**
     * Constructs a new Manifest instance.
     * @param {string} fileName The filename to fallback on if the user doesn't set the name attribute in their manifest file.
     * @param {object} object The object to parse into a Manifest instance.
     */
    constructor(fileName, object) {
        if (typeof(filename) !== 'string')
            throw new Error(`Failed to create instance of Manifest class: Required arg "fileName" in constructor is not a string (${fileName})`);
        if (typeof(object) !== 'object')
            throw new Error(`Failed to create instance of Manifest class: Required arg "json" in constructor is not an object (${object})`);

        this.fileName = fileName;
        this.object = object;

        if (!object)
            throw new Error('Failed to create instance of Manifest class: Required arg "json" in constructor is invalid');

        // MARK: PARSING

        const parsedValues = {
            name: undefined, // Not required; A name will be determined one way or the other
            rootDirectory: undefined, // Required, root directory
            outputPath: undefined, // Required, output path
            shortcuts: [] // Not required; Should always be an array
        };

        // MARK: Parse name
        {
            if (this.hasNameAttribute()) {
                parsedValues.name = object.name;
            } else {
                const extensionsToRemove = ['.yml', '.yaml', '.manifest', '.example'];
                parsedValues.name = getFileBasenameWithoutExtensions(this.fileName, extensionsToRemove, true);
            }

            if (!parsedValues.name) {
                throw new Error(`Failed to create instance of Manifest class: Could not determine attribute "name" which should always be set in the file or inferred from the file name (${this.fileName})`);
            }
        }

        // MARK: Parse root directory
        {
            const keys = [object.rootDirectory, object.root, object.directory, object.rootDir];
            for (const value of keys) {
                if (value && value.trim() !== '') {
                    parsedValues.rootDirectory = value;
                    break;
                }
            }
            
            if (!parsedValues.rootDirectory) {
                throw new Error(`Failed to create instance of Manifest class: Could not find required attribute "rootDirectory" or any of its aliases (${this.fileName})`);
            }
        }

        // MARK: Parse output path
        {
            const keys = [object.outputPath, object.output];
            for (const value of keys) {
                if (value && value.trim() !== '') {
                    parsedValues.outputPath = value;
                    break;
                }
            }

            if (!parsedValues.outputPath) {
                throw new Error(`Failed to create instance of Manifest class: Could not find required attribute "outputPath" or any of its aliases (${this.fileName})`);
            }
        }

        // MARK: Parse shortcuts
        {
            const keys = [object.shortcuts, object.entries];
            for (const value of keys) {
                if (value) {
                    if (!Array.isArray(value)) {
                        throw new Error('Failed to create instance of Manifest class: Shortcuts were a non-array when expected to be an array of things or an empty array (${this.fileName})')
                    }
                    // TODO Reduce amount of errors in parsing, this is just for testing

                    for (const shortcut of value) {
                        try {
                            const instance = new Shortcut(parsedValues.rootDirectory, shortcut);
                            if (!instance) {
                                throw new Error(`Failed to instantiate Shortcut while constructing Manifest: Shortcut was not truthy (${parsedValues.name})`);
                            }
                            parsedValues.shortcuts.push(instance);
                        } catch {
                            console.error(`Something went wrong when instantiating a Shortcut while constructing Manifest: ${parsedValues.name}`);
                        }
                    }
                }
            }

            if (!parsedValues.shortcuts) {
                throw new Error(`Failed to create instance of Manifest class: Shortcuts were invalid when expected to be an array of things or an empty array (${this.fileName})`);
            }
        }

        this.name = parsedValues.name;
        this.rootDirectory = parsedValues.rootDirectory;
        this.outputPath = parsedValues.outputPath;
        this.shortcuts = parsedValues.shortcuts;
    }

    getOutputPath() {
        return this.outputPath;
    }

    // TODO Calculate write path
    getWritePath() {
        return this.outputPath;
    }

    getRootDirectory() {
        return this.rootDirectory;
    }

    getFileName() {
        return this.fileName;
    }

    hasNameAttribute() {
        return this.object.name && this.object.name.trim() !== '';
    }

    getNameAttribute() {
        if (!this.object.name || this.object.name.trim() === '')
            return null;

        return this.object.name;
    }

    /**
     * Determine where Manifest#getName retrieves its name from.
     * If there is a valid "name" attribute in the JSON, the value of it will be used
     * and the returned value of this function will be "attribute".
     * Otherwise, the fallback filename provided in the constructor will be used and
     * the returned value of this function will be "filename";
     * @returns {string} Either "attribute" or "filename"
     */
    getNameSource() {
        if (this.hasNameAttribute()) {
            return "attribute";
        } else {
            return "filename";
        }
    }

    getName() {
        if (this.hasNameAttribute()) {
            return this.getNameAttribute();
        } else {
            return this.getFileName();
        }
    }

    getShortcuts() {
        return this.shortcuts;
    }

    isShortcutsEmpty() {
        return this.getShortcuts().length === 0;
    }

    isShortcutsNotEmpty() {
        return this.getShortcuts().length > 0;
    }

    getEnabledShortcuts() {
        return this.getShortcuts().filter(shortcut => {
            return shortcut.enabled === true;
        });
    }
}

class ManifestOld {

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

    // TODO Rewrite to calculate output filepath based on given output value
    async getWritePath() {
        const outputPath = await this.getOutputPath();
        return outputPath;
    }

    async getRootDirectory() {
        const fileExists = await this.doesFileExist();

        if (!fileExists) {
            throw new Error(`Unable to getRootDirectory for non-existent file: "${this.filePath}"`);
        }

        const data = await this.getObject();

        if (data.root) {
            return data.root;
        } else if (data.directory) {
            return data.directory;
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