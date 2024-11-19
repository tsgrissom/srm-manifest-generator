import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

class Manifest {

    constructor(filePath) {
        this.filePath = filePath;

        if (!fs.existsSync(filePath)) {
            console.warn(`Manifest object created from non-existent file: "${filePath}"`);
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

    async getJsonObject() {
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

        const data = await this.getJsonObject();

        if (data === null) {
            return false;
        }

        const { name } = data;

        if (name === null || name.trim() === '') {
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

        const data = await this.getJsonObject();
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
}

export default Manifest;