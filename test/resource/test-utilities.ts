import path from 'node:path';
import tmp from 'tmp';

const getYamlPostfix = (
    randomizedExt = true
) => {
    if (randomizedExt) {
        return Math.random() < 0.5 ? '.yml' : '.yaml'; 
    } else {
        return '.yml';
    }
}

export const tmpFileName = (
    prefix?: string,
    postfix?: string
): string => {
    const tmpName = tmp.tmpNameSync({ prefix: prefix, postfix: postfix })
    return path.basename(tmpName);
}

export const tmpFileNameYml = (
    prefix?: string,
    randomizedExt = true
): string => {
    const postfix = getYamlPostfix(randomizedExt);
    return tmpFileName(prefix, postfix);
}

export const tmpFileNameManifestYml = (
    prefix?: string,
    randomizedExt = true
): string => {
    let postfix = '.manifest';
    postfix += getYamlPostfix(randomizedExt);
    return tmpFileName(prefix, postfix);
}