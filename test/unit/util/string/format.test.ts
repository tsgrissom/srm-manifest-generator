import clr from 'chalk';

import * as fmt from '../../../../src/util/string/format.js';
import { setOfEmptyStrings } from '../../../helpers.js';

describe('Function: bool()', () => {
	test.each([
		// expected, input, options (color, capitalize, trueStr, falseStr)
		[
			'yes',
			true,
			{ color: false, capitalize: false, trueStr: 'yes', falseStr: 'no' },
		],
		[
			'no',
			false,
			{ color: false, capitalize: false, trueStr: 'yes', falseStr: 'no' },
		],

		// param: color
		[
			clr.green('yes'),
			true,
			{ color: true, capitalize: false, trueStr: 'yes', falseStr: 'no' },
		],
		[
			clr.red('no'),
			false,
			{ color: true, capitalize: false, trueStr: 'yes', falseStr: 'no' },
		],

		// param: capitalize
		['Yes', true, { color: false, capitalize: true, trueStr: 'yes', falseStr: 'no' }],
		['No', false, { color: false, capitalize: true, trueStr: 'yes', falseStr: 'no' }],

		// param: color + capitalize
		[
			clr.green('Yes'),
			true,
			{ color: true, capitalize: true, trueStr: 'yes', falseStr: 'no' },
		],
		[
			clr.red('No'),
			false,
			{ color: true, capitalize: true, trueStr: 'yes', falseStr: 'no' },
		],
	])('returns %p given %p when options=%p', (expected, b, options) => {
		expect(fmt.bool(b, options)).toBe(expected);
	});
});

// describe('Function: fmtBool()', () => {

// 	// TODO More
// });

// MARK: fmtPath
describe(`Function: fmtPath`, () => {
	test.each(setOfEmptyStrings)(`returns given str if empty: %p`, value => {
		expect(fmt.path(value)).toBe(value);
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
			expect(fmt.path(filePath, useUnderline, useQuotes)).toBe(expected);
		},
	);
});
