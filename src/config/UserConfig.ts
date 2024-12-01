import { Manifest } from '../type/Manifest.js';

interface UserConfigData {
    search: {
        scanDirectories: boolean;
        scanRecursively: boolean;
        manifests: Manifest[];
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

class UserConfig {
    data: UserConfigData = {
        search: {
            scanDirectories: true,
            scanRecursively: false,
            manifests: []
        },
        output: {
            minify: true, // TODO Implement
            indentationSpaces: 2, // TODO Implement
            spreadMode: 'file' // TODO Implement
        },
        validation: {
            validateFilePaths: true, // TODO Implement
            validateExecutables: true, // TODO Implement
            acceptedExecutables: ['.exe'] // TODO Implement
        },
        logging: {
            enabled: true, // TODO Implement
            outputFile: './srm-manifest-generator.log' // TODO Implement
        }
    }
}

export {
    UserConfigData,
    UserConfig
};