import clr from 'chalk';

import * as fmt from '../../../../src/util/string/format.js';

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
