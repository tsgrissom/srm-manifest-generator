import { ConfigData } from './ConfigData';
import { Manifest } from './Manifest.js';

// TODO ExampleConfig

class UserConfig implements ConfigData {
    search: { scanDirectories: boolean; scanRecursively: boolean; manifests: Manifest[]; };
    output: { minify: boolean; indentationSpaces: number; spreadMode: string; };
    validation: { validateFilePaths: boolean; validateExecutables: boolean; acceptedExecutables: string[]; };
    logging: { enabled: boolean; outputFile: string; };

    // TODO constructor arg which sets options based on a given ConfigData? then falls back on the defaults?
    constructor() {
        this.search = {
            scanDirectories: true,
            scanRecursively: false,
            manifests: []
        }
        this.output = {
            minify: true,
            indentationSpaces: 2,
            spreadMode: 'file'
        }
        this.validation = {
            validateFilePaths: true,
            validateExecutables: true,
            acceptedExecutables: ['.exe']
        }
        this.logging = {
            enabled: true,
            outputFile: './srm-manifest-generator.log'
        }
    }

    getManifestPaths() : string[] {
        return this.search.manifests.map(man => man.filePath);
    }
}

export { UserConfig };