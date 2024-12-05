/**
 * A pair of `string` values representing a given key and
 * a resolved key for parsing user configurations. The key
 * on the left is a potential alias which points to the
 * "real" key on the right, otherwise known as the resolved
 * key.
 * 
 * See: {@link resolveKeyFromAlias} 
 * 
 * * The resolved key can be re-used multiple times to
 *   create multiple aliases.
 * * Create a constant of this type for each section of
 *   configuration you need to parse.
 * * Use the {@link resolveKeyFromAlias} function to
 *   determine the {@link ConfigKeyPair} for the context.
 * 
 * the first of which indicates a potential
 * alias for the second value, the latter of which is the reference
 * point for 
 */
type ConfigKeyAliases = Record<string, string>;

export default ConfigKeyAliases;