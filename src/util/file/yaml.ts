// MARK: TYPES

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
 *   determine the {@link ResolvedYamlKey} for the context.
 *
 * the first of which indicates a potential
 * alias for the second value, the latter of which is the reference
 * point for
 */
type YamlKeyAliases = Record<string, string>;

/**
 * Represents the result of a config key-value resolving operation.
 * The {@link givenKey} is the key that the user used in their
 * configuration which is a known alias for the {@link resolvedKey}.
 * The latter is the reference point that aliases point to, with
 * both being stored here for info/debugging purposes.
 *
 * See also:
 *
 * * {@link YamlKeyAliases}
 * * {@link resolveKeyFromAlias}
 */
interface ResolvedYamlKey {
	/**
	 * The key the user used in their configuration which was
	 * resolved to be referring to the {@link resolvedKey}.
	 *
	 * Find a resolved key using: {@link resolveKeyFromAlias}
	 */
	givenKey: string;

	/**
	 * The key which is the reference point for its known aliases
	 * to refer to when determining what value the user wanted to
	 * set in their config when the {@link givenKey} was used.
	 *
	 * Should be resolved using: {@link resolveKeyFromAlias}
	 */
	resolvedKey: string;

	fullGivenKey: string;

	fullResolvedKey: string;
}

// MARK: FUNCTIONS

/**
 * Resolves a {@link ResolvedYamlKey} from the {@link givenKey} by searching the
 * {@link keyAliases} for a matching alias.
 *
 * @param keyAliases The map of alias to reference values for a given config section.
 * @param givenKey The key the user actually gave in an iteration over a section's
 *  contents.
 * @param sectionFullKey The full key that is being searched within for a given context.
 *  By default this value is empty, which represents top-level key searches. However,
 *  if used to search within levels which are any deeper, giving this value is important
 *  so the secondary full key values are inferred correctly automatically.
 * @returns A {@link ResolvedYamlKey} containing the {@link ResolvedYamlKey.resolvedKey}
 *  as well as the {@link givenKey} as {@link ResolvedYamlKey.resolvedKey}.
 * @example
 */
// TODO Example
// TEST Unit
function resolveKeyFromAlias(
	keyAliases: YamlKeyAliases,
	givenKey: string,
	sectionFullKey?: string,
): ResolvedYamlKey {
	const upperKey = sectionFullKey ?? '';
	return {
		givenKey: givenKey,
		resolvedKey: keyAliases[givenKey] || givenKey,
		fullGivenKey: joinPathKeys(upperKey, givenKey),
		fullResolvedKey: joinPathKeys(upperKey, givenKey),
	};
}

/**
 * Joins a series of YAML path keys with '.' characters
 * in order to constructor a full key to a section, value,
 * etc.
 *
 * * If a key starts or ends with a '.' character, it will
 *   be ignored. Keys containing '.' inside will not be ignored
 *   because those might be multi-leveled keys themselves.
 * * If a key is empty or consists of only whitespace, it
 *   will be ignored
 * * Therefore, it's important to **check the returned value**
 *   for emptiness because an empty string could be returned
 *
 * @param keys The keys to join.
 * @returns The resulting joined key which points to a
 *  value which is found deeper than the top level of the
 *  document.
 */
// TODO jsdoc + example
// TEST Unit
function joinPathKeys(...keys: Array<string>): string {
	return keys
		.filter(k => !k.startsWith('.'))
		.filter(k => !k.endsWith('.'))
		.filter(k => k.trim() !== '')
		.join('.');
}

export { ResolvedYamlKey, YamlKeyAliases, joinPathKeys, resolveKeyFromAlias };
