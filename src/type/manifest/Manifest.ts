import path from 'node:path';

import { basenameWithoutExtensions } from '../../utility/path.js';

import Shortcut from '../shortcut/Shortcut.js';
import ManifestData from './ManifestData.js';
import ManifestNameSource from './ManifestNameSource.js';

// TODO getName by ManifestNameSource

// TODO jsdoc
class Manifest {

    // TODO jsdoc
    filePath: string;
    // TODO jsdoc
    data: ManifestData;

    /**
     * Constructs a new Manifest instance.
     * @param filePath The filepath of this Manifest's source file. Not read in the constructor, but used as a fallback name if name attribute is not set inside the file.
     * @param data The object to parse into a Manifest instance.
     */
    constructor(filePath: string, data: ManifestData) {
        if (typeof(filePath) !== 'string')
            throw new Error(`Failed to create instance of Manifest class: Required arg "filePath" in constructor is not a string (${filePath})`);
        if (typeof(data) !== 'object')
            throw new Error(`Failed to create instance of Manifest class: Required arg "object" in constructor is not an object (${data})`);

        this.filePath = filePath;
        this.data = data;

        if (!data)
            throw new Error('Failed to create instance of Manifest class: Required arg "object" in constructor is invalid');
    }
    
    // TODO jsdoc
    getOutputPath() : string {
        return this.data.outputPath;
    }

    // TODO Calculate write path
    getWritePath() : string {
        return this.data.outputPath;
    }

    // TODO jsdoc
    getRootDirectory() : string {
        return this.data.rootDirectory;
    }

    // TODO jsdoc
    getFilePath() : string {
        return this.filePath;
    }

    // TODO jsdoc
    getFileBasename() : string {
        return path.basename(this.filePath);
    }

    // TODO jsdoc
    getFallbackName() : string {
        return basenameWithoutExtensions(this.filePath, ['.yml', '.yaml', '.manifest', '.example'], true);
    }

    // TODO jsdoc
    hasNameAttribute() : boolean {
        if (!this.data.name)
            return false;

        return this.data.name.trim() !== '';
    }

    // TODO jsdoc
    getNameAttribute() : string {
        if (!this.data.name || this.data.name.trim() === '')
            return '';

        return this.data.name;
    }

    /**
     * Determine where Manifest#getName retrieves its name from.
     * If there is a valid "name" attribute in the JSON, the value of it will be used
     * and the returned value of this function will be `Manifest.NameSource.ATTRIBUTE`.
     * Otherwise, the fallback filename provided in the constructor will be used and
     * the returned value of this function will be `Manifest.NameSource.FILENAME`;
     * @returns {Manifest.NameSource} Either `ATTRIBUTE` or `FILENAME`.
     */
    getNameSource() : ManifestNameSource {
        if (this.hasNameAttribute()) {
            return ManifestNameSource.Attribute;
        } else {
            return ManifestNameSource.Filename;
        }
    }

    // TODO jsdoc
    getName() : string {
        if (this.hasNameAttribute()) {
            return this.getNameAttribute();
        } else {
            return this.getFileBasename();
        }
    }

    // TODO jsdoc
    getShortcuts() : Shortcut[] {
        return this.data.shortcuts;
    }
}

export default Manifest;