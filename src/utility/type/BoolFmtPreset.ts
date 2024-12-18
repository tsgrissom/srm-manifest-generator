// TEST Unit

import BoolFmtOptions from './BoolFmtOptions';

// TODO jsdoc
const BoolFmtPreset: Record<string, BoolFmtOptions> = {
	/** "true" / "false" - color on, capitalize off */
	TrueFalse: { color: true, capitalize: false, trueStr: 'true', falseStr: 'false' },
	/** "Yes" / "No" - color on, capitalize off */
	YesNo: { color: true, capitalize: true, trueStr: 'yes', falseStr: 'no' },
	/** "On" / "Off" - color on, capitalize off */
	OnOff: { color: true, capitalize: true, trueStr: 'on', falseStr: 'off' },
	/** "Enabled" / "Disabled" - color on, capitalize off */
	EnabledDisabled: {
		color: true,
		capitalize: true,
		trueStr: 'enabled',
		falseStr: 'disabled'
	},
	/** "enable" / "disable" - color on, capitalize off */
	EnableDisable: {
		color: true,
		capitalize: false,
		trueStr: 'enable',
		falseStr: 'disable'
	},
	/** "✓" (unicode 2713) / "✕" (unicode 2715) - color on */
	CheckCross: { color: true, capitalize: false, trueStr: '\u2713', falseStr: '\u2715' },
	/** "✔" (unicode 2714) / "✖" (unicode 2716) */
	CheckCrossHeavy: {
		color: true,
		capitalize: false,
		trueStr: '\u2714',
		falseStr: '\u2716'
	}
};

export default BoolFmtPreset;