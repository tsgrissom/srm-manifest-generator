import { ConfigData } from '../../../../src/config/type/ConfigData';
import { defaultConfigData } from '../../../../src/config/type/DefaultConfig';
import { UserConfig } from '../../../../src/config/type/UserConfig';
import {
	clogConfigFatalErr,
	clogConfigKeyUnknown,
	logConfigValueUnknown,
	clogConfigWarn,
} from '../../../../src/util/logging/config';

let logSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;
let warnSpy: jest.SpyInstance;

const confValidateConfigKeysOff: Partial<ConfigData> = {
	validate: {
		...defaultConfigData.validate,
		configKeys: false
	}
};
const confValidateConfigKeysOn: Partial<ConfigData> = {
	validate: {
		...defaultConfigData.validate,
		configKeys: true
	}
};

beforeEach(() => {
	logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
	errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
	warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	jest.restoreAllMocks();
});

// MARK: GENERIC

describe(`Function: clogConfigWarn()`, () => {
	it('logs to stderr at level warn', () => {
		clogConfigWarn('str');
		expect(warnSpy).toHaveBeenCalled();
	});
});

describe(`Function: clogConfigFatalErr()`, () => {
	it('logs to stderr at level error', () => {
		clogConfigFatalErr('str');
		expect(errorSpy).toHaveBeenCalled();
	});
});

// MARK: SECTION HEADERS

describe(`Function: dlogConfigSectionStart()`, () => {
	it.todo('does not log to stdout if debugging is off');
	it.todo(`logs to stdout if debugging is on`);
});

describe(`Function: dlogConfigSectionOk()`, () => {
	it.todo('does not log to stdout if debugging is off');
	it.todo(`logs to stdout if debugging is on`);
});

// MARK: LINT SECTIONS

describe(`Function: dlogConfigWarnMissingOptionalSection()`, () => {});

describe(`Function: dlogConfigWarnOptionalSectionSkipped()`, () => {});

describe(`Function: dlogConfigWarnOptionalSectionSkippedWrongType()`, () => {});

describe(`Function: clogConfigFatalErrMissingRequiredSection()`, () => {});

describe(`Function: clogConfigFatalErrRequiredSectionWrongType()`, () => {});

// MARK: LINT KEYS

describe(`Function: clogConfigKeyUnknown()`, () => {
	// it.todo('logs to stdout if enabled by config');
	it.todo('logs to stdout if config is undefined');

	let configValidateConfigKeysOff: UserConfig;
	let configValidateConfigKeysOn: UserConfig;

	beforeEach(() => {
		configValidateConfigKeysOff = new UserConfig(confValidateConfigKeysOff);
		configValidateConfigKeysOn = new UserConfig(confValidateConfigKeysOn);
	});

	it('does not log to stdout if disabled by config', () => {
		clogConfigKeyUnknown('some.full.key', configValidateConfigKeysOff);
		expect(logSpy).not.toHaveBeenCalled();
	});

	it('logs to to stdout if enabled by config', () => {
		clogConfigKeyUnknown('some.full.key', configValidateConfigKeysOn);
		expect(logSpy).toHaveBeenCalled();
	});
});

// MARK: LINT VALUES

describe(`Function: vlogConfigValueLoaded()`, () => {
	it.todo('does not log to stdout if verbose is off');
	it.todo('logs to stdout if verbose is on');
});

describe(`Function: clogConfigValueUnknown()`, () => {
	test.each([
		'foo',
		42,
		3.14,
		true,
		false,
		[],
		['some', 'list', 'xyz'],
		{},
		{ aKey: 'a value', anotherKey: 42 },
	])('logs to stdout (%p)', value => {
		logConfigValueUnknown('some.full.key', value);
		expect(logSpy).toHaveBeenCalled();
	});
});

describe(`Function: clogConfigValueWrongType()`, () => {});
