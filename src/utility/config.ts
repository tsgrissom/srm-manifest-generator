/* eslint-disable @typescript-eslint/no-explicit-any */

import clr from 'chalk';

import { fmtBool } from './boolean';
import { clog } from './console';
import { dlog, isDebugActive } from './debug';
import { quote } from './string';
import {
    SB_OK_LG,
    SB_OK_SM,
    SB_ERR_LG,
    SB_WARN,
    UNICODE_ARRW_RIGHT,
    SB_ERR_SM
} from './symbols';

import { USER_CONFIG_ATTRIBUTION, USER_CONFIG_PFX } from '../config/config';

// MARK: Utility

export type YamlKeyAliases = Record<string, string>;

export function resolveKeyFromAlias(aliases: YamlKeyAliases, key: string) : string {
    return aliases[key] || key;
}

export function joinPathKey(...keys: string[]) {
    return keys.join('.');
}

// MARK: General Logs

export const clogConfInfo = (msg?: any) =>
    clog(` > ` + USER_CONFIG_PFX + `: ` + msg);

export const clogConfOk   = (msg?: any) =>
    clog(` > ` + USER_CONFIG_PFX + ` ` + SB_OK_LG + ` ${msg}`);

export const clogConfSucc = (emphasis: boolean, msg?: any) =>
    clog(`  ` + (emphasis ? SB_OK_LG : SB_OK_SM) + ` ${msg}`);

export const clogConfBad2 = (msg?: any) =>
    clog(` ` + SB_ERR_LG + ` ` + USER_CONFIG_PFX + `: ${msg}`);

export const clogConfWarn = (msg?: any) =>
    console.warn(` ` + SB_WARN + ` ` + USER_CONFIG_PFX + `: ${msg}`);
// TODO Check out where these old styles are used and replace
export const clogConfErr  = (msg?: any) =>
    console.error(clr.red(USER_CONFIG_PFX) + `: ${msg}`);

export const dlogConfInfo = (msg?: any) =>
    isDebugActive() && clogConfInfo(msg); 

export const dlogConfSectionStart = (sectionKey: string) => {
    dlog(UNICODE_ARRW_RIGHT + clr.underline(`Loading: Config section "${sectionKey}"`))
}

// MARK: Section Logging

export const dlogConfMissingOptionalSection = (sectionKey: string) =>
    dlog(`${SB_WARN} ${USER_CONFIG_ATTRIBUTION} is missing optional section ${quote(sectionKey)}`);

export const dlogConfSkippedSection = (sectionKey: string, reason: string) =>
    dlog(`${SB_ERR_LG} Skipped config section ${quote(sectionKey)}: ${reason}`);

export const dlogConfSkippedSectionWrongType = (sectionKey: string) => {

}

export const dlogConfSectionOk = (sectionKey: string) =>
    console.log(SB_OK_LG + ` ` + clr.underline(`Loaded: Config section "${sectionKey}"`));

const fmtValueForLoadedLog = (value?: any) : string => {
    if (value === undefined) value = '';
    
    let fmtValue: string = value;
    if (typeof value === 'string')
        fmtValue = value !== '' ? quote(value) : '';
    else if (typeof value === 'boolean')
        fmtValue = fmtBool(value);
    // TODO More type fmts

    return fmtValue;
}

export const dlogConfValueLoaded = (key: string, value?: any) =>
    dlog(`  ${SB_OK_SM} Value loaded ${quote(key)} (${fmtValueForLoadedLog(value)})`);

export const clogConfValueErr = (key: string, msg: string) =>
    clog(`  ${SB_ERR_SM} Value of key ${quote(key)} ${msg}`);

export const clogConfValueWrongType = (key: string, desiredType: string, value?: any, displayValue = true) => {
    const valuef = fmtValueForLoadedLog(value);
    let msg = `must be a ${desiredType} but was`

    if (value === undefined) msg += ` not`;
    else msg += ` a ${typeof value}`

    if (displayValue)
        msg += ` (Value: ${valuef})`;

    clogConfValueErr(key, `${msg}`)
}