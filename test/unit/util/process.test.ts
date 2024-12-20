/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
	doArgsInclude,
	doesPlatformExist,
	isProcessRunning,
	KNOWN_NODE_PLATFORMS,
} from '../../../src/util/process';

describe('Function: doArgsInclude()', () => {
	let originalArgv: Array<string>;
	const simpleArgsToSearch = ['arg1', 'arg2'];
	const customArgsToSearch = ['--foo', '--bar', '--baz'];

	beforeEach(() => {
		originalArgv = process.argv;
	});

	afterEach(() => {
		process.argv = originalArgv;
	});

	it('returns false if default process.argv w/ < 3 arguments', () => {
		process.argv = ['node', 'script.js'];
		expect(doArgsInclude()).toBe(false);
	});

	it('returns false if empty array for arg "argsToFind"', () => {
		expect(doArgsInclude(process.argv, ...[])).toBe(false);
	});

	it('returns false if empty array for arg "argsToSearch"', () => {
		expect(doArgsInclude([], '--foo')).toBe(false);
	});

	it('returns true if any values of "argsToFind" present in "argsToSearch"', () => {
		expect(doArgsInclude(simpleArgsToSearch, 'arg2')).toBe(true);
	});

	it('returns false if no values of "argsToFind" present in "argsToSearch"', () => {
		expect(doArgsInclude(simpleArgsToSearch, 'arg3')).toBe(false);
	});

	it('returns true for custom "argsToSearch" + "argsToFind"', () => {
		expect(doArgsInclude(customArgsToSearch, '--baz')).toBe(true);
	});

	it('returns false if none of the "argsToFind" match', () => {
		expect(doArgsInclude(customArgsToSearch, '--xyz', '--abc')).toBe(false);
	});

	it('checks process.argv for matches when no "argsToSearch" provided', () => {
		process.argv = ['node', 'script.js', '--foo'];
		expect(doArgsInclude(undefined, '--foo')).toBe(true);
	});

	it('is case sensitive', () => {
		const argsToSearch = ['Arg1', 'Arg2'];
		expect(doArgsInclude(argsToSearch, 'arg1')).toBe(false);
	});
});

// MARK: Fn doesPlatformExist

describe('Function: doesPlatformExist()', () => {
	test.each(KNOWN_NODE_PLATFORMS)('returns true for known Node platforms', value => {
		expect(doesPlatformExist(value)).toBe(true);
	});

	test.each([
		'macos',
		'windows',
		'debian',
		'archlinux',
		'osx',
		'windows11',
		'windows10',
		'windows7',
	])('returns false for unknown Node platforms', value => {
		expect(doesPlatformExist(value)).toBe(false);
	});
});

// MARK: Fn isProcessRunning

// TODO TEST More unit tests
// TODO TEST Test argument checking
// FIXME Broken on macOS
describe('Function: isProcessRunning()', () => {
	it('throws err if platformOptions is null', async () => {
		await expect(isProcessRunning(null as any)).rejects.toThrow();
	});

	it('resolves to be truthy if platformOptions undefined', async () => {
		await expect(isProcessRunning(undefined as any)).resolves.toBeTruthy();
	});

	it('throws err if platformOptions is non-object', async () => {
		await expect(isProcessRunning('invalid' as any)).rejects.toThrow();
	});

	it('throws err if platformsOptions is array', async () => {
		await expect(isProcessRunning([] as any)).rejects.toThrow();
	});

	it('resolves its Promise given default options', async () => {
		await expect(isProcessRunning()).resolves.not.toThrow();
	});
});
