import path from 'node:path';

import { logDebug } from './util/utilities.js';
import { basenameWithoutExtensions } from './util/file-utilities.js';
import Shortcut from './Shortcut.js';

class Manifest {

    static NameSource = {
        ATTRIBUTE: 'Attribute',
        FILENAME: 'Filename'
    };

    /**
     * Constructs a new Manifest instance.
     * @param {string} filePath The filepath of this Manifest's source file. Not read in the constructor, but used as a fallback name if name attribute is not set inside the file.
     * @param {object} object The object to parse into a Manifest instance.
     */
    constructor(filePath, object) {
        if (typeof(filePath) !== 'string')
            throw new Error(`Failed to create instance of Manifest class: Required arg "filePath" in constructor is not a string (${filePath})`);
        if (typeof(object) !== 'object')
            throw new Error(`Failed to create instance of Manifest class: Required arg "object" in constructor is not an object (${object})`);

        this.filePath = filePath;
        this.object = object;

        if (!object)
            throw new Error('Failed to create instance of Manifest class: Required arg "object" in constructor is invalid');

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
                parsedValues.name = this.getFallbackName();
                logDebug('Had to fallback to source filename while creating Manifest instance because no name attribute was set within the source file:');
                logDebug(`- Source file: "${this.filePath}"`, false);
                logDebug(`- Basename: "${path.basename(this.filePath)}"`);
                logDebug(`- Resolved name: "${parsedValues.name}"`);
            }
        }

        if (!parsedValues.name) {
            throw new Error(`Failed to create instance of Manifest class: Could not determine attribute "name" which should always be set in the file or inferred from the file name (${this.filePath})`);
        }

        this.name = parsedValues.name;

        // MARK: Parse root directory
        {
            const keys = [object.rootDirectory, object.root, object.directory, object.rootDir];
            for (const value of keys) {
                if (value && value.trim() !== '') {
                    parsedValues.rootDirectory = value;
                    break;
                }
            }
        }

        if (!parsedValues.rootDirectory) {
            throw new Error(`Failed to create instance of Manifest class: Could not find required attribute "rootDirectory" or any of its aliases (${this.filePath})`);
        }
        
        this.rootDirectory = parsedValues.rootDirectory;

        // MARK: Parse output path
        {
            const keys = [object.outputPath, object.output];
            for (const value of keys) {
                if (value && value.trim() !== '') {
                    parsedValues.outputPath = value;
                    break;
                }
            }
        }

        if (!parsedValues.outputPath) {
            throw new Error(`Failed to create instance of Manifest class: Could not find required attribute "outputPath" or any of its aliases (${this.filePath})`);
        }

        this.outputPath = parsedValues.outputPath;

        // MARK: Parse shortcuts
        {
            const keys = [object.shortcuts, object.entries, object.titles]
                .filter(section => !section); // Filter out falsy sections

            for (const sectionKey of keys.filter(section => !section)) {
                if (!sectionKey) {
                    console.warn(`Non-truthy section key: ${sectionKey}`);
                    continue;
                }

                if (!Array.isArray(sectionKey)) {
                    console.error(`Shortcuts was a non-array where it should be an array for Manifest: ${this.name}`);
                }

                for (const object of sectionKey) {
                    console.log(`typeof expected shortcut obj: ${typeof object}`);

                    const shortcut = new Shortcut(this, object);
                    if (!shortcut)
                        console.error(`A created Shortcut was not truthy: ${this.name}`);
                    
                    parsedValues.shortcuts.push(shortcut);
                }
            }
        }

        if (!parsedValues.shortcuts)
            throw new Error(`Shortcuts were invalid when expected to be an array of shortcuts or an empty array (${this.name})`);
        if (!Array.isArray(parsedValues.shortcuts))
            throw new Error(`Shortcuts were a non-array when expected to be an array (${this.name})`);

        this.shortcuts = parsedValues.shortcuts;
    }

    // TODO jsdoc
    getOutputPath() {
        return this.outputPath;
    }

    // TODO Calculate write path
    getWritePath() {
        return this.outputPath;
    }

    // TODO jsdoc
    getRootDirectory() {
        return this.rootDirectory;
    }

    getFilePath() {
        return this.filePath;
    }

    getFileBasename() {
        return path.basename(this.filePath);
    }

    // TODO jsdoc
    getFallbackName() {
        return basenameWithoutExtensions(this.filePath, ['.yml', '.yaml', '.manifest', '.example'], true);
    }

    // TODO jsdoc
    hasNameAttribute() {
        if (!this.object.name)
            return false;

        return this.object.name.trim() !== '';
    }

    // TODO jsdoc
    getNameAttribute() {
        if (!this.object.name || this.object.name.trim() === '')
            return null;

        return this.object.name;
    }

    /**
     * Determine where Manifest#getName retrieves its name from.
     * If there is a valid "name" attribute in the JSON, the value of it will be used
     * and the returned value of this function will be `Manifest.NameSource.ATTRIBUTE`.
     * Otherwise, the fallback filename provided in the constructor will be used and
     * the returned value of this function will be `Manifest.NameSource.FILENAME`;
     * @returns {Manifest.NameSource} Either `ATTRIBUTE` or `FILENAME`.
     */
    getNameSource() {
        if (this.hasNameAttribute()) {
            return Manifest.NameSource.ATTRIBUTE;
        } else {
            return Manifest.NameSource.FILENAME;
        }
    }

    // TODO jsdoc
    getName() {
        if (this.hasNameAttribute()) {
            return this.getNameAttribute();
        } else {
            return this.getFileBasename();
        }
    }

    // TODO jsdoc
    getShortcuts() {
        return this.shortcuts;
    }
}

export default Manifest;