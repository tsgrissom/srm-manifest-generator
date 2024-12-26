import { ConfigData, ConfigSectionLog, ConfigSectionSearch, ConfigSectionTransform, ConfigSectionValidate } from './ConfigData';

// TODO jsdoc
class DefaultConfig implements ConfigData {

    private _search: ConfigSectionSearch;
    private _validate: ConfigSectionValidate;
    private _transform: ConfigSectionTransform;
    private _log: ConfigSectionLog;

    get search(): ConfigSectionSearch {
        return this._search;
    }

    get validate(): ConfigSectionValidate {
        return this._validate;
    }

    get transform(): ConfigSectionTransform {
        return this._transform;
    }

    get log(): ConfigSectionLog {
        return this._log;
    }

    constructor(data: ConfigData) {
        this._search = {
            manifests: [],
            withinDirectories: data.search.withinDirectories,
            recursively: data.search.recursively,
        };
        this._validate = {
            configKeys: data.validate.configKeys,
            filePaths: data.validate.filePaths,
            executables: data.validate.executables
        };
        this._transform = {
            minify: data.transform.minify,
            indentationSpaces: data.transform.indentationSpaces,
            mode: data.transform.mode
        };
        this._log = {
            console: data.log.console,
            file: data.log.file
        }
    }
}

export default DefaultConfig;