import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

class Manifest {

    constructor(filePath) {
        this.filePath = filePath;
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
        if (!this.doesFileExist()) {
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
            throw new Error(`File does not exist: "${this.filePath}"`);
        }

        const name = path.basename(this.filePath);
        return name;
    }

    // TODO: Write tests
    async getNameInsideOfFile() {

    }

    async getSourceName() {
        const data = await this.getJsonObject();
        const nameInsideFile = data.name;
        const nameOfFile = path.basename(this.filePath);

        let name = nameOfFile;

        if (nameInsideFile !== null && nameInsideFile.trim() !== '') {
            name = nameInsideFile;
        }

        return name;
        
        // TODO: Return data.name or the input file's name is none is found
    }
}

export default Manifest;