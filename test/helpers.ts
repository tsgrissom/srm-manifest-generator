import path from 'node:path';
import tmp from 'tmp';

// MARK: Helper Functions

const getYamlPostfix = (randomizedExt = true): string => {
	if (randomizedExt) {
		return Math.random() < 0.5 ? '.yml' : '.yaml';
	} else {
		return '.yml';
	}
};

export const tmpFileName = (prefix?: string, postfix?: string): string => {
	const tmpName = tmp.tmpNameSync({ prefix: prefix, postfix: postfix });
	return path.basename(tmpName);
};

export const tmpFileNameYml = (prefix?: string, randomizedExt = true): string => {
	const postfix = getYamlPostfix(randomizedExt);
	return tmpFileName(prefix, postfix);
};

export const tmpFileNameManifestYml = (prefix?: string, randomizedExt = true): string => {
	let postfix = '.manifest';
	postfix += getYamlPostfix(randomizedExt);
	return tmpFileName(prefix, postfix);
};

// MARK: Value Sets

export const setOfFalsy = [false, null, undefined, NaN, ''];
export const setOfNonBooleans = [[], {}, 'string', 42, 3.14];
export const setOfNonNumbers = [false, true, null, undefined, NaN, 'string'];
export const setOfNonArrays = [null, undefined, NaN, {}, 'string', 42, 3.14];
export const setOfNonStrings = [null, undefined, NaN, [], {}, 42, 3.14];

export const setOfEmptyStrings = ['', ' ', '   ', '    '];
export const setOfWhitespaceStrings = [' ', '   ', '    '];
