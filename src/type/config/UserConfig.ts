import ConfigData from './ConfigData.js';
import Manifest from '../manifest/Manifest.js';

// TODO ExampleConfig

class UserConfig implements ConfigData {
    search: { manifests: Manifest[]; scanDirectories: boolean; scanRecursively: boolean; };
    output: { minify: boolean; indentSpaces: number; mode: string; };
    validate: { filePaths: boolean; executables: boolean; executableExtensions: string[]; };
    other: { useColor: boolean; debug: boolean; verbose: boolean; };
    logs: { enabled: boolean; output: string; format: string; };

    constructor() {
        this.search = {
            manifests: [],
            scanDirectories: true,
            scanRecursively: false,
        }
        this.output = {
            minify: true,
            indentSpaces: 2,
            mode: 'combine'
        }
        this.validate = {
            filePaths: true,
            executables: true,
            executableExtensions: ['.exe']
        }
        this.other = {
            useColor: true,
            debug: false,
            verbose: false
        }
        this.logs = {
            enabled: true,
            output: './',
            format: 'srmmg_YYYY-MM-DD_HH-MM-SS.log'
        }
    }

    // TODO constructor arg which sets options based on a given ConfigData? then falls back on the defaults?
    
    getManifestPaths() : string[] {
        return this.search.manifests.map(man => man.filePath);
    }
}

export { UserConfig };