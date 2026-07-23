import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import vue from "eslint-plugin-vue";

export default [
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            "public/assets/**",
            "vendor/**"
        ]
    },
    js.configs.recommended,
    ...vue.configs["flat/recommended"],
    {
        files: ["**/*.{js,mjs,ts,vue}"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.es2021,
                ...globals.jquery,
                moment: "readonly"
            }
        },
        rules: {
            indent: [
                "error",
                4,
                {
                    SwitchCase: 1
                }
            ],
            "linebreak-style": [
                "error",
                "unix"
            ],
            quotes: [
                "error",
                "double",
                {
                    avoidEscape: true,
                    allowTemplateLiterals: true
                }
            ],
            semi: [
                "error",
                "always"
            ],
            "brace-style": [
                "error",
                "1tbs"
            ],
            curly: [
                "error",
                "all"
            ],
            "space-before-blocks": [
                "error",
                "always"
            ],
            "space-infix-ops": [
                "error",
                {
                    int32Hint: false
                }
            ],
            "space-unary-ops": [
                "off",
                {
                    words: true,
                    nonwords: false
                }
            ],
            "no-unused-vars": "warn",
            "no-undef": "warn",
            "no-console": "off",
            "vue/html-indent": [
                "error",
                4,
                {
                    attribute: 1,
                    closeBracket: 0,
                    alignAttributesVertically: true,
                    ignores: []
                }
            ],
            "vue/html-self-closing": [
                "off"
            ],
            "vue/attribute-hyphenation": [
                "off"
            ],
            "vue/v-on-event-hyphenation": [
                "error",
                "never"
            ],
            "vue/custom-event-name-casing": [
                "error",
                "camelCase"
            ]
        }
    },
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser
        },
        rules: {
            "no-undef": "off"
        }
    },
    {
        files: ["**/*.vue"],
        languageOptions: {
            parserOptions: {
                parser: tsParser,
                extraFileExtensions: [".vue"]
            }
        },
        rules: {
            "no-undef": "off"
        }
    },
    {
        files: [
            "eslint.config.mjs",
            "postcss.config.js",
            "tailwind.config.js",
            "vite.config.mjs",
            "resources/assets/js/__tests__/**/*.test.ts"
        ],
        languageOptions: {
            globals: {
                ...globals.node
            }
        }
    }
];
