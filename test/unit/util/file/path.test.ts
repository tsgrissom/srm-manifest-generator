import path from 'node:path';

import mockFs from 'mock-fs';
import {
	basenameWithoutExtensions,
	isPathAccessible,
	normalizeFileExtension,
} from '../../../../src/util/file/path';
import { setOfNonStrings } from '../../../helpers';

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

// MARK: hasFileExtension
describe('Function: hasFileExtension()', () => {
	// TEST Params
	// Param: fileName
	// Param: fileExt
	// TEST Functionality
});

// MARK: replaceFileExtension
describe('Function: replaceFileExtension()', () => {
	// TEST Params
	// TEST Functionality
});

describe(`Function: removeFileExtension()`, () => {
	// TEST Functionality
});

// MARK: basenameWithoutExtensions
describe('Function: basenameWithoutExtensions', () => {
	it('removes one extension when no params', () => {
		expect(basenameWithoutExtensions('str.yml')).toBe('str');
		expect(basenameWithoutExtensions('Some Filename.txt')).toBe('Some Filename');
	});

	it('removes all extensions when no params', () => {
		expect(basenameWithoutExtensions('str.manifest.yml')).toBe('str');
		expect(basenameWithoutExtensions('Some Filename.manifest.yml')).toBe(
			'Some Filename',
		);
	});

	// TEST More coverage
});
