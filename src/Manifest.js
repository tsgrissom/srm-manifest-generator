import fs from "node:fs";

class Manifest {

    constructor(inputFilePath) {
        this.inputFilePath = inputFilePath;
    }

    async getDataAsString() {
        const path = this.inputFilePath;

        try {
            const fileHandle = await fs.promises.open(path, 'r');
            const fileContents = await fs.promises.readFile(path, 'utf8');
            await fileHandle.close();
            return fileContents;
        } catch {
            throw new Error(`Could not find the referenced file: "${path}"`);
        }
    }

    async getDataAsObject() {
        const data = await this.getDataAsString();
        return JSON.parse(data);
    }

    async getSourceName() {
        const data = await this.getDataAsObject();
        // TODO: Return data.name or the input file's name is none is found
    }
}

export default Manifest;