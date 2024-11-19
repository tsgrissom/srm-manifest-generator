import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

class Manifest {

    constructor(filePath) {
        this.filePath = filePath;
    }

    async doesFileExist() {
        try {
            await fs.promises.open(path, 'r');
            return true;
        } catch {
            return false;
        }
    }

    async getDataAsString() {
        const path = this.filePath;

        if (!this.doesFileExist()) {
            throw new Error(`Could not find the referenced file: "${path}"`);
        }

        const fileContents = await fs.promises.readFile(path, 'utf8');
        return fileContents;
    }

    async getDataAsObject() {
        const rawData = await this.getDataAsString(); // Assumed to be YAML file
        const yamlData = YAML.stringify(rawData);
        return JSON.parse(yamlData);
    }

    async getSourceName() {
        const data = await this.getDataAsObject();
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