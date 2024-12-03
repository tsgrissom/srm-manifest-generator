type YamlKeyAliases = Record<string, string>;

function resolveKeyFromAlias(aliases: YamlKeyAliases, key: string) : string {
    return aliases[key] || key;
}

export {
    YamlKeyAliases,
    resolveKeyFromAlias
}