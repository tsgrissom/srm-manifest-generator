import clr from 'chalk';
import { fmtBool, formattedBoolean } from '../../src/utility/boolean';
import { setOfNonBooleans } from '../resource/test-values';

describe('Function: formattedBoolean()', () => {
	it.each(setOfNonBooleans)('throws err if arg "b" is non-boolean: %p', value => {
		expect(() => {
			formattedBoolean(value as unknown as boolean, true, true, 'yes', 'no');
		}).toThrow();
	});

	it.each([
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

describe('Function: fmtBool()', () => {
	it.each(setOfNonBooleans)('throws err if arg "b" is non-boolean: %p', value => {
		expect(() => {
			fmtBool(value as unknown as boolean);
		}).toThrow();
	});

	// TODO More
});
