/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
    arrowParens: 'avoid',
    bracketSpacing: true,
    printWidth: 90,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 4,
    useTabs: true,

    plugins: ['prettier-plugin-organize-imports'],
};

export default config;
