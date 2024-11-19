import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

class Manifest {

    // TODO: Write tests
    constructor(filePath) {
        this.filePath = filePath;

        if (!fs.existsSync(filePath)) {
            console.warn(`Manifest object created from non-existent file: "${filePath}"`);
        }
    }

    async doesFileExist() {
        try {
            await fs.promises.open(this.filePath, 'r');
            return true;
        } catch {
            return false;
        }
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

    // TODO: Write tests
    async getNameOfFile() {
        // if (!fs.existsSync(this.filePath)) {
        //     throw new Error(`File does not exist: "${this.filePath}"`);
        // }

        const fileExists = await this.doesFileExist();

        if (!fileExists) {
            throw new Error(`Unable to getNameOfFile for non-existent file: "${this.filePath}"`);
        }

        const name = path.basename(this.filePath);
        return name;
    }

    // TODO: Write tests
    async getNameInsideOfFile() {
        const data = await this.getJsonObject();
        const { name } = data;

        if (name === null || name.trim() === '') {
            return null;
        }

        return name;
    }

    async getSourceName() {
        const fileExists = await this.doesFileExist();

        if (!fileExists) {
            throw new Error(`Unable to getSourceName for non-existent file: "${this.filePath}"`);
        }

        const nameOfFile = await this.getNameOfFile();
        const nameInFile = await this.getNameInsideOfFile();

        let sourceName = nameOfFile;

        console.log(`NAME OF FILE: ${nameOfFile}`);
        console.log(`NAME IN FILE: ${nameInFile}`);

        if (nameInFile !== null) {
            sourceName = nameInFile;
        }

        console.log(`SOURCE NAME: ${sourceName}`);

        return sourceName;
    }
}

export default Manifest;