import { ConfigData, ConfigDataSectionLog, ConfigDataSectionSearch, ConfigDataSectionTransform, ConfigDataSectionValidate, OutputMode } from './ConfigData.js';

export const defaultConfigData = {
	search: {
		manifests: [],
        withinDirectories: true,
        recursively: false,
	},
	validate: {
		configKeys: true,
        filePaths: true,
        executables: {
            enabled: true,
            acceptedExtensions: ['.exe'],
        },
	},
	transform: {
		minify: true,
        indentationSpaces: 2,
        outputMode: OutputMode.Combine,
	},
    log: {
        console: {
            withColor: true,
            debug: false,
            verbose: false,
        },
        file: {
            enabled: true,
            outputPath: './',
            nameFormat: 'srmg_YYYY-MM-DD_HH-MM-SS.log',
        },
    }
};

export function createDefaultConfigData(overrides: Partial<ConfigData> = {}): ConfigData {
    return {
        ...defaultConfigData,
        ...overrides
    }
}

// TODO jsdoc
class DefaultConfig implements ConfigData {

    private _search: ConfigDataSectionSearch;
    private _validate: ConfigDataSectionValidate;
    private _transform: ConfigDataSectionTransform;
    private _log: ConfigDataSectionLog;

    get search(): ConfigDataSectionSearch {
        return this._search;
    }

    get validate(): ConfigDataSectionValidate {
        return this._validate;
    }

    get transform(): ConfigDataSectionTransform {
        return this._transform;
    }

    get log(): ConfigDataSectionLog {
        return this._log;
    }

    constructor(data?: Partial<ConfigData>) {
        const defaults: ConfigData = createDefaultConfigData(data);
        this._search = defaults.search;
        this._validate = defaults.validate;
        this._transform = defaults.transform;
        this._log = defaults.log;
    }
}

export default DefaultConfig;