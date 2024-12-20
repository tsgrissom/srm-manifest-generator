import {
	FLAGS_DEBUG,
	FLAGS_VERBOSE,
	isDebugActive,
	isEnvDebug,
	isEnvVerbose,
	isProcessDebugging,
	isProcessVerbose,
	isVerbose,
} from '../../../src/util/logging/debug';

const originalArgv = [...process.argv];
const originalEnv = { ...process.env };

let logSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;
let warnSpy: jest.SpyInstance;

beforeEach(() => {
	logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
	errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
	warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

	process.argv = [...originalArgv];
	process.env = { ...originalEnv };
});

afterEach(() => {
	jest.restoreAllMocks();

	process.argv = [...originalArgv];
	process.env = originalEnv;
});

describe(`Function: isProcessDebugging()`, () => {
	test.each(FLAGS_DEBUG)('returns true if argv has %p', value => {
		process.argv = ['node', 'script.js', value];
		expect(isProcessDebugging()).toBe(true);
	});

	it('returns false if argv not debug', () => {
		process.argv = ['node', 'script.js', '--foo'];
		expect(isProcessDebugging()).toBe(false);
	});

	it('returns false if argv not debug and env debug', () => {
		process.env.DEBUG = 'true';
		process.argv = ['node', 'script.js', '--foo'];
		expect(isProcessDebugging()).toBe(false);
	});
});

describe(`Function: isProcessVerbose()`, () => {
	test.each(FLAGS_VERBOSE)('returns true if argv has %p', value => {
		process.argv = ['node', 'script.js', value];
		expect(isProcessVerbose()).toBe(true);
	});

	it('returns false if argv not verbose', () => {
		process.argv = ['node', 'script.js', '--foo'];
		expect(isProcessVerbose()).toBe(false);
	});

	it('returns false if argv not verbose and env verbose', () => {
		process.env.VERBOSE = 'true';
		process.argv = ['node', 'script.js', '--foo'];
		expect(isProcessVerbose()).toBe(false);
	});
});

describe(`Function: isEnvDebug()`, () => {
	it('returns true if env.DEBUG true', () => {
		process.env.DEBUG = 'true';
		expect(isEnvDebug()).toBe(true);
	});

	it('returns false if env.DEBUG false', () => {
		process.env.DEBUG = 'false';
		expect(isEnvDebug()).toBe(false);
	});

	it('returns false if env.DEBUG undefined', () => {
		delete process.env.DEBUG;
		expect(isEnvDebug()).toBe(false);
	});
});

describe(`Function: isEnvVerbose()`, () => {
	it('returns true if env.VERBOSE true', () => {
		process.env.VERBOSE = 'true';
		expect(isEnvVerbose()).toBe(true);
	});

	it('returns false if env.VERBOSE false', () => {
		process.env.VERBOSE = 'false';
		expect(isEnvVerbose()).toBe(false);
	});

	it('returns false if env.VERBOSE undefined', () => {
		delete process.env.VERBOSE;
		expect(isEnvVerbose()).toBe(false);
	});
});

describe(`Function: isDebugActive()`, () => {
	test.each(FLAGS_DEBUG)(
		'returns true if argv has %p but env.DEBUG undefined',
		value => {
			delete process.env.DEBUG;
			process.argv = ['node', 'script.js', value];
			expect(isDebugActive()).toBe(true);
		},
	);

	test.each(FLAGS_DEBUG)('returns true if argv has %p but env.DEBUG false', value => {
		process.env.DEBUG = 'false';
		process.argv = ['node', 'script.js', value];
		expect(isDebugActive()).toBe(true);
	});

	test.each(FLAGS_DEBUG)(
		'returns true if both env.DEBUG true and argv has %p',
		value => {
			process.env.DEBUG = 'true';
			process.argv = ['node', 'script.js', value];
			expect(isDebugActive()).toBe(true);
		},
	);

	it('returns true if env debug but argv not debug', () => {
		process.env.DEBUG = 'true';
		process.argv = ['node', 'script.js', '--foo'];
		expect(isDebugActive()).toBe(true);
	});

	it('returns false if env.DEBUG undefined and argv not debug', () => {
		delete process.env.DEBUG;
		process.argv = ['node', 'script.js', '--foo'];
		expect(isDebugActive()).toBe(false);
	});

	it('returns false if env.DEBUG false and argv not debug', () => {
		process.env.DEBUG = 'false';
		process.argv = ['node', 'script.js', '--foo'];
		expect(isDebugActive()).toBe(false);
	});
});

describe(`Function: isVerbose()`, () => {
	test.each(FLAGS_VERBOSE)(
		'returns true if argv has %p but env.VERBOSE undefined',
		value => {
			delete process.env.VERBOSE;
			process.argv = ['node', 'script.js', value];
			expect(isVerbose()).toBe(true);
		},
	);

	test.each(FLAGS_VERBOSE)(
		'returns true if argv has %p but env.VERBOSE false',
		value => {
			process.env.VERBOSE = 'false';
			process.argv = ['node', 'script.js', value];
			expect(isVerbose()).toBe(true);
		},
	);

	test.each(FLAGS_VERBOSE)(
		'returns true if both env.VERBOSE true and argv has %p',
		value => {
			process.env.VERBOSE = 'true';
			process.argv = ['node', 'script.js', value];
			expect(isVerbose()).toBe(true);
		},
	);

	it('returns true if env verbose but argv not verbose', () => {
		process.env.VERBOSE = 'true';
		process.argv = ['node', 'script.js', '--foo'];
		expect(isVerbose()).toBe(true);
	});

	it('returns false if env.VERBOSE undefined and argv not verbose', () => {
		delete process.env.VERBOSE;
		process.argv = ['node', 'script.js', '--foo'];
		expect(isVerbose()).toBe(false);
	});

	it('returns false is env.VERBOSE false and argv not verbose', () => {
		process.env.VERBOSE = 'false';
		process.argv = ['node', 'script.js', '--foo'];
		expect(isVerbose()).toBe(false);
	});
});
