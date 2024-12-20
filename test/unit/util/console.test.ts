import { clog, clogErr, clogList, clogWarn } from '../../../src/util/console';

let logSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;
let warnSpy: jest.SpyInstance;

beforeEach(() => {
	logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
	errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
	warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	jest.restoreAllMocks();
});

describe('clog', () => {
	it('logs messages to standard output stream', () => {
		clog('Hello, World!');
		expect(logSpy).toHaveBeenCalledWith('Hello, World!');
	});
});

describe('Function: clogList', () => {
	it('logs each line with prefix to stdout', () => {
		clogList('prefix', 'message1', 'message2');
		expect(logSpy).toHaveBeenCalledWith('prefixmessage1');
		expect(logSpy).toHaveBeenCalledWith('prefixmessage2');
	});

	it('uses default prefix if none provided', () => {
		clogList(undefined, 'message1', 'message2');
		expect(logSpy).toHaveBeenCalledWith(' - message1');
		expect(logSpy).toHaveBeenCalledWith(' - message2');
	});
});

describe('clogErr', () => {
	it('logs each line to stderr', () => {
		clogErr('error1', 'error2');
		expect(errorSpy).toHaveBeenCalledWith('error1');
		expect(errorSpy).toHaveBeenCalledWith('error2');
	});
});

describe('clogWarn', () => {
	it('logs each line to stderr at warn level', () => {
		clogWarn('warn1', 'warn2');
		expect(warnSpy).toHaveBeenCalledWith('warn1');
		expect(warnSpy).toHaveBeenCalledWith('warn2');
	});
});
