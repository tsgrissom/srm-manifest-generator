import { Manifest } from '../type/Manifest.js';

interface UserConfig {
    search: {
        scanDirectories: boolean;
        scanRecursively: boolean;
        manifests: string[];
    },
    output: {
        minify: boolean;
        indentationSpaces: number;
        spreadMode: "file";
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

export {
    UserConfig
};