import UserConfig from '../../../type/config/UserConfig';
import chalk from 'chalk';
import { dlog } from '../../../utility/debug';
import { clogConfValueWrongType, clogConfWarn, dlogConfMissingOptionalSection, dlogConfSectionStart, dlogConfSectionOk, dlogConfValueLoaded, joinPathKey, resolveKeyFromAlias, YamlKeyAliases } from '../../../utility/config';
import { clog } from '../../../utility/console';
import { quote } from '../../../utility/string';
import { SB_ERR_LG, SB_ERR_SM, SB_OK_LG } from '../../../utility/symbols'

const keyAliases: YamlKeyAliases = {
    minify: 'minify',
    indentSpaces: 'indentSpaces',
    indentationSpaces: 'indentSpaces',
    mode: 'mode',
    outputMode: 'mode'
}

async function parseOutputSection(data: object, userConfig: UserConfig) : Promise<UserConfig> {
    const sectionKey = 'output';
    
    if (!Object.keys(data).includes(sectionKey)) {
        dlogConfMissingOptionalSection(sectionKey);
        return userConfig;
    }

    const section = (data as Record<string, unknown>)[sectionKey];

    if (typeof section !== 'object' || section === null) {
        clog(`${SB_ERR_LG} Skipped section "output": Value of "output" should be a section but was a ${typeof section}`);
        return userConfig;
    }

    if (Array.isArray(section)) {
        clog(`${SB_ERR_LG} Skipped section: "output": Value of "output" should be a section but was an array`);
        return userConfig;
    }

    dlogConfSectionStart('output');
    
    for (const [key, value] of Object.entries(section)) {
        const resolved = resolveKeyFromAlias(keyAliases, key);
        const fullAliasKey = joinPathKey('output', key);
        const fullRealKey  = joinPathKey('output')

        switch (resolved) {
            case 'minify': {
                if (typeof value !== 'boolean') {
                    clog(` ${SB_ERR_SM} Value of key "output.minify" must be a boolean but was not: ${value}`);
                    break;
                }

                userConfig.output.minify = value;
                dlogConfValueLoaded('output.minify', value);
                break;
            }
            case 'indentSpaces': {
                if (typeof value !== 'number') {
                    clog(` ${SB_ERR_SM} Value of key "output.indentSpaces" must be a number but was not: ${value}`);
                    break;
                }

                userConfig.output.indentSpaces = value;
                dlogConfValueLoaded('output.indentSpaces', value);
                break;
            }
            case 'mode': {
                if (typeof value !== 'string') {
                    clogConfValueWrongType('output.mode', 'string', value);
                    break;
                }

                userConfig.output.mode = value;
                dlogConfValueLoaded('output.mode', value);
                break;
            }
            default: {
                const unknown = quote(`output.${key}`);
                clogConfWarn(`Unknown key set at ${unknown}`);
            }
        }
    }

    dlog(`${SB_OK_LG} ` + chalk.underline(`Loaded: Config section "output"`));
    dlogConfSectionOk('output');

    return userConfig;
}

export default parseOutputSection;