import clr from 'chalk';
import { formattedBoolean } from '../../../src/util/boolean';

describe('Function: formattedBoolean()', () => {
	test.each([
		// bool, color, capitalize, trueStr, falseStr, expected
		[true, false, false, 'yes', 'no', 'yes'],
		[false, false, false, 'yes', 'no', 'no'],

		// param: color
		[true, true, false, 'yes', 'no', clr.green('yes')],
		[false, true, false, 'yes', 'no', clr.red('no')],

		// param: capitalize
		[true, false, true, 'yes', 'no', 'Yes'],
		[false, false, true, 'yes', 'no', 'No'],

		// param: color + capitalize
		[true, true, true, 'yes', 'no', clr.green('Yes')],
		[false, true, true, 'yes', 'no', clr.red('No')],
	])(
		'returns expected given input parameters',
		(bool, color, capitalize, trueStr, falseStr, expected) => {
			expect(formattedBoolean(bool, color, capitalize, trueStr, falseStr)).toBe(
				expected,
			);
		},
	);
});

// describe('Function: fmtBool()', () => {

// 	// TODO More
// });
