import path from 'node:path';

import clr from 'chalk';
import mockFs from 'mock-fs';

import {
	basenameWithoutExtensions,
	fmtPath,
	isPathAccessible,
	normalizeFileExtension,
	pathHasFileExtension,
	replaceFileExtension,
} from '../../../src/util/file/path';
import { setOfEmptyStrings, setOfNonStrings } from '../../helpers';

const tmpPath = 'tmp/path.test';
const existentFilePath = path.join(tmpPath, 'exists.txt');
const nonExistentDirPath = path.join(tmpPath, 'doesnt/exist');
const nonExistentFilePath = path.join(tmpPath, 'doesnt-exist.txt');

beforeEach(() => {
	mockFs({
		'tmp/path.test': {
			'exists.txt': 'some text inside',
		},
	});
});

afterEach(() => {
	mockFs.restore();
});

// MARK: basenameWithoutExtensions
describe('Function: basenameWithoutExtensions', () => {
	const okExtsToRemove = ['.yml', '.yaml'];
	const okFilenamesWithExtensions = [
		'Manifest.example.yml',
		'Something.yml',
		'Some Filename.yml',
	];

	test.each(setOfNonStrings)('throws err when non-string fileName arg: %p', value => {
		expect(() =>
			basenameWithoutExtensions(value as unknown as string, okExtsToRemove),
		).toThrow();
	});

	test.each([
		{
			params: {
				fileName: 'Manifest.example.manifest.yml',
				extsToRemove: ['.yml', '.yaml', '.manifest', '.example'],
				iterate: true,
			},
			expected: 'Manifest',
		},
		// TODO: More cases
	])('returns expected given valid manifest file name', ({ params, expected }) => {
		const result = basenameWithoutExtensions(
			params.fileName,
			params.extsToRemove,
			params.iterate,
		);
		expect(result).toBe(expected);
	});

	test.each(okFilenamesWithExtensions)(
		'returns str whose path.basename equals empty str when filenames w/ exts given as fileName arg + wildcard given as extsToRemove arg',
		value => {
			const result = basenameWithoutExtensions(value, '*', true);
			const actual = path.extname(result);
			const expected = '';
			expect(actual).toBe(expected);
		},
	);
});

// MARK: fmtPath
describe(`Function: fmtPath`, () => {
	test.each(setOfEmptyStrings)(`returns given str if empty: %p`, value => {
		expect(fmtPath(value)).toBe(value);
	});

	test.each([
		// filePath, useUnderline, useQuotes, expected
		['str', false, false, 'str'],
		['str', true, true, clr.underline(`"str"`)],
		['str', false, true, `"str"`],
		['str', true, false, clr.underline(`str`)],
	])(
		`returns expected for given input parameters`,
		(filePath, useUnderline, useQuotes, expected) => {
			expect(fmtPath(filePath, useUnderline, useQuotes)).toBe(expected);
		},
	);
});

// MARK: normalizeFileExtension
describe('Function: normalizeFileExtension()', () => {
	test.each(setOfNonStrings)(
		'throws err when param extname passed a non-str: %p',
		value => {
			expect(() => normalizeFileExtension(value as unknown as string)).toThrow();
		},
	);

	// TODO TEST param excludeExts

	test.each([
		// input, expected
		['yml', '.yml'],
		['yaml', '.yaml'],
		['json', '.json'],
		['jsonc', '.jsonc'],
	])(
		'returns expected for given input (Input: %p, Expected: %p)',
		(input, expected) => {
			expect(normalizeFileExtension(input)).toBe(expected);
		},
	);

	test.each(['.yml', '.yaml', '.json', '.jsonc'])(
		'returns given str when already has period prefix: %p',
		value => {
			expect(normalizeFileExtension(value)).toBe(value);
		},
	);
});

// MARK: pathHasFileExtension
describe('Function: pathHasFileExtension()', () => {
	// Param: fileName

	test.each(setOfNonStrings)('throws err when non-str filePath arg: %p', value => {
		expect(() => pathHasFileExtension(value as unknown as string)).toThrow();
	});

	// Param: fileExt

	test.each(setOfEmptyStrings)('throws err when empty str fileExt arg: %p', value => {
		expect(() =>
			pathHasFileExtension('manifest.yml', value as unknown as string),
		).toThrow();
	});

	// TODO TEST Functionality
});

// MARK: replaceFileExtension
describe('Function: replaceFileExtension()', () => {
	// Param: findExt
	test.each(setOfEmptyStrings)('throws err when empty str findExt arg: %p', value => {
		expect(() => replaceFileExtension('manifest.yml', value, '.json')).toThrow();
	});

	// TODO TEST Functionality
});

// MARK: isPathAccessible
describe(`Function: isPathAccessible()`, () => {
	it('resolves true given existing dir path', async () => {
		await expect(isPathAccessible(tmpPath)).resolves.toBe(true);
	});

	it('resolves true given existing file path', async () => {
		await expect(isPathAccessible(existentFilePath)).resolves.toBe(true);
	});

	it('resolves false given non-existent dir path', async () => {
		await expect(isPathAccessible(nonExistentDirPath)).resolves.toBe(false);
	});

	it('resolves false given non-existent file path', async () => {
		await expect(isPathAccessible(nonExistentFilePath)).resolves.toBe(false);
	});
});
