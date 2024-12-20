/**
 * Represents the app's symbol modes for console output. By default,
 * the symbol used will be {@link modern}, but {@link compatibility} and
 * {@link disabled} are offered for flexibility in other environments.
 * 
 * For plain symbols: {@link PlainSymbols}
 * For styled symbols: {@link StyledSymbols}
 */
interface UnicodeModeMap {
    
    /**
     * The primary Unicode representation for modern environments.
     * Typically a Unicode character or symbol optimized for modern systems.
     * 
     * * May employ modern techniques such as {@link String.fromCodePoint}
     *   which are less compatible with older environments.
     * * If issues occur with such Unicode characters, fallback to 
     * 
     * @example
     * // Small checkmark
     * '\u2713'
     * // Heavy right-facing arrow
     * String.fromCodePoint(0x1F846)
     */
    modern: string,

    /**
     * A fallback Unicode representation for environments with limited
     * compatibility.
     * 
     * * Often identical to {@link modern}, unless the modern
     *   symbol utilizes less compatible techniques such as
     *   {@link String.fromCodePoint}. 
     * * In that specific case, the compatible symbol will be a
     *   manually encoded surrogate pair for better compatibility.
     * 
     * @example
     * // Small checkmark
     * '\u2713'
     * // Heavy right-facing arrow
     * '\uD83C\uDF0A'
     */
    compatibility?: string,
    
    /**
     * A plain-text representation used when the user disables Unicode
     * characters entirely. Ideal for ASCII-only environments or
     * minimalistic outputs.
     * 
     * @example
     * // Plus sign as a replacement for small checkmark
     * '+'
     * // Plain-text arrow as a replacement for the heavy right-facing arrow
     * '->'
     */
    disabled: string,
    
    /**
     * A description of the symbol's purpose or context. Provides additional
     * metadata for better understanding/debugging.
     */
    description: string
};

export default UnicodeModeMap;