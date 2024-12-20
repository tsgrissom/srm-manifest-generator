import { getPackageJson, isExpectedPackageJson } from '../../../../src/util/file/package';

const invalidPackageJsonSamples = [
	{},
	{
		version: '1.0',
	},
	{
		bugs: 'a url',
	},
	{
		homepage: 'a url',
	},
	{
		readme: 'a url',
	},
];

const validPackageJsonSamples = [
	{
		version: '',
		bugs: '',
		homepage: '',
		readme: '',
	},
	{
		version: '1.0',
		bugs: 'url',
		homepage: 'url',
		readme: 'url',
	},
];

describe(`Typeguard: isExpectedPackageJson()`, () => {
	it('returns false for a string', () => {
		expect(isExpectedPackageJson('foo')).toBe(false);
	});
	it('returns false for a number', () => {
		expect(isExpectedPackageJson(42)).toBe(false);
	});
	it('returns false for true', () => {
		expect(isExpectedPackageJson(true)).toBe(false);
	});
	it('returns false for undefined', () => {
		expect(isExpectedPackageJson(undefined)).toBe(false);
	});
	it('returns false for an array', () => {
		expect(isExpectedPackageJson([])).toBe(false);
	});

	test.each(invalidPackageJsonSamples)(
		`returns false for invalid object: %p`,
		value => {
			expect(isExpectedPackageJson(value)).toBe(false);
		},
	);

	test.each(validPackageJsonSamples)('returns true for valid object: %p', value => {
		expect(isExpectedPackageJson(value)).toBe(true);
	});
});

describe(`Function: getPackageConfig()`, () => {
	it('returns an object which conforms to ExpectedPackageJson', () => {
		const packageJson = getPackageJson();
		expect(isExpectedPackageJson(packageJson)).toBe(true);
	});
});
