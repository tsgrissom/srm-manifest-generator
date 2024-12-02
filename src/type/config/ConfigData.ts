import Manifest from '../manifest/Manifest.js';

// TODO jsdoc for everything

interface ConfigData {
    search: {
        manifests: Manifest[];
        scanDirectories: boolean;
        scanRecursively: boolean;
    },
    output: {
        minify: boolean;
        indentSpaces: number;
        mode: string;
    },
    validate: {
        filePaths: boolean;
        executables: boolean;
        executableExtensions: string[];
    },
    other: {
        useColor: boolean;
        debug: boolean;
        verbose: boolean;
    },
    logs: {
        enabled: boolean;
        output: string;
        format: string;
    }
}

export default ConfigData;