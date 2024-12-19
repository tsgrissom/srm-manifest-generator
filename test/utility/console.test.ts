import { clog } from '../../src/utility/console';

let logSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;
let warnSpy: jest.SpyInstance;

beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('clog', () => {
    test('logs messages to standard output stream', () => {
        clog('Hello, World!');
        expect(logSpy).toHaveBeenCalledWith('Hello, World!');
    });
});