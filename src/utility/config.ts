/* eslint-disable @typescript-eslint/no-explicit-any */

import clr from 'chalk';

import { fmtBool } from './boolean';
import { clog } from './console';
import { isDebugActive } from './debug';
import {
    SB_OK_LG,
    SB_OK_SM,
    SB_ERR_LG,
    SB_WARN,
    quote
} from './string';

import { USER_CONFIG_PFX, README_URL } from '../config/config';
import { USER_CONFIG_FILENAME } from '../config/load-data';

export type YamlKeyAliases = Record<string, string>;

export function resolveKeyFromAlias(aliases: YamlKeyAliases, key: string) : string {
    return aliases[key] || key;
}

export function joinPathKey(...keys: string[]) {
    return keys.join('.');
}

console.log(`Test: ${joinPathKey('validate', 'filePath')}`);

export const clogConfInfo = (msg?: any) =>
    clog(` > ` + USER_CONFIG_PFX + `: ` + msg);

export const clogConfOk   = (msg?: any) =>
    clog(` > ` + USER_CONFIG_PFX + ` ` + SB_OK_LG + ` ${msg}`);

export const clogConfSucc = (emphasis: boolean, msg?: any) =>
    clog(` ` + (emphasis ? SB_OK_LG : SB_OK_SM) + ` ` + USER_CONFIG_PFX + `: ${msg}`);

export const clogConfBad2 = (msg?: any) =>
    clog(` ` + SB_ERR_LG + ` ` + USER_CONFIG_PFX + `: ${msg}`);

export const clogConfWarn = (msg?: any) =>
    console.warn(` ` + SB_WARN + ` ` + USER_CONFIG_PFX + `: ${msg}`);

export const clogConfErr  = (msg?: any) =>
    console.error(clr.red(USER_CONFIG_PFX) + `: ${msg}`);

export const clogConfInvalid = (msg: string) => {
    console.error(clr.red(USER_CONFIG_PFX) + clr.redBright(`: User ${USER_CONFIG_FILENAME} is invalid - ${msg}`));
    console.error(clr.red('See the README: ') + clr.redBright.underline(README_URL));
}

export const dlogConfInfo = (msg?: any) => { if (isDebugActive()) clogConfInfo(msg) }

export const dlogConfValueLoaded = (key: string, value?: any) => {
    if (!isDebugActive()) return;
    if (value === undefined) value = '';

    // TODO Move code to string util quote
    let fmtValue: string = value;
    if (typeof value === 'string')
        fmtValue = value !== '' ? `"${value}"` : '';
    else if (typeof value === 'boolean')
        fmtValue = fmtBool(value);

    clogConfSucc(false, `Value loaded ${quote(key)} (${fmtValue})`);
    // clogConfSucc(false, `Value of "${key}" set=${fmtValue}`);
}