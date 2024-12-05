/**
 * Represents the result of a config key-value resolving operation.
 * The {@link givenKey} is the key that the user used in their
 * configuration which is a known alias for the {@link resolvedKey}.
 * The latter is the reference point that aliases point to, with
 * both being stored here for info/debugging purposes.
 * 
 * See also:
 * 
 * * {@link ConfigKeyAliases}
 * * {@link resolveKeyFromAlias}
 */
type ConfigKeyPair = {

    /**
     * The key the user used in their configuration which was
     * resolved to be referring to the {@link resolvedKey}.
     * 
     * Find a resolved key using: {@link resolveKeyFromAlias}
     */
    givenKey: string,

    /**
     * The key which is the reference point for its known aliases
     * to refer to when determining what value the user wanted to
     * set in their config when the {@link givenKey} was used.
     * 
     * Should be resolved using: {@link resolveKeyFromAlias}
     */
    resolvedKey: string

    fullGivenKey: string,

    fullResolvedKey: string
};

export default ConfigKeyPair;