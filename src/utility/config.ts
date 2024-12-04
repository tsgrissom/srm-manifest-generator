type YamlKeyAliases = Record<string, string>;

function resolveKeyFromAlias(aliases: YamlKeyAliases, key: string) : string {
    return aliases[key] || key;
}

// TODO Move console log funcs here

function joinPathKey(...keys: string[]) {
    // TODO
    return keys;
}

export {
    YamlKeyAliases,
    resolveKeyFromAlias
}