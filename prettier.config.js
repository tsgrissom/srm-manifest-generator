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
    tabWidth: 4,
    trailingComma: 'all',

    plugins: ['prettier-plugin-organize-imports'],
};

export default config;