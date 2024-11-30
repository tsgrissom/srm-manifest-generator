import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  {
    ignores: ["**/*.config.js"],
    rules: {
      "curly": "off",

      "no-unused-vars": "warn",
      "prefer-destructuring": "warn",
      "prefer-arrow-callback": "warn",
      "prefer-const": "warn",
      "no-var": "warn",
      "eqeqeq": "warn",
      "camelcase": "warn",
      "semi": "warn",
      "no-constant-condition": "warn",
      "quotes": ["warn", "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
      
      "no-undef": "error",
    }
  }
];