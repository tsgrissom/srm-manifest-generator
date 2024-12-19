// TODO Once functions for pulling PlainSymbols are done, set up these ones
// TODO Once all of that is done, phase out the hardcoded symbols

import UnicodeModeMap from './UnicodeModeMap.js';

/**
 * Sets of symbols with styling such as color applied
 * to them.
 * Which symbol is used in the app is determined by the
 * user configuration, but the default will be the
 * `unicode` option.
 * 
 * For non-styled, plain symbol presets: {@link PlainSymbols}
 */
const StyledSymbols: Record<string, UnicodeModeMap> = {
    /** A small, bright green checkmark unicode symbol */
    okSm: {
        modern: '',
        compatibility: '',
        disabled: '',
        description: ''
    },
    /** A bigger, bright green checkmark unicode symbol */
    okLg: {
        modern: '',
        compatibility: '',
        disabled: '',
        description: ''
    },
    /** A bright yellow warning sign unicode symbol */
    warn: {
        modern: '',
        compatibility: '',
        disabled: '',
        description: ''
    },
    /** A small, bright red x-mark unicode symbol */
    errSm: {
        modern: '',
        compatibility: '',
        disabled: '',
        description: ''
    },
    /** A bigger, bright red x-mark unicode symbol */
    errLg: {
        modern: '',
        compatibility: '',
        disabled: '',
        description: ''
    }
}

export default StyledSymbols;