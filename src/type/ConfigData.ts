import Manifest from './Manifest.js';

// TODO jsdoc for everything

interface ConfigData {
    search: {
        scanDirectories: boolean;
        scanRecursively: boolean;
        manifests: Manifest[];
    },
    output: {
        minify: boolean;
        indentationSpaces: number;
        spreadMode: string;
    },
    validation: {
        validateFilePaths: boolean;
        validateExecutables: boolean;
        acceptedExecutables: string[];
    },
    logging: {
        enabled: boolean;
        outputFile: string;
    }
}

export default ConfigData;