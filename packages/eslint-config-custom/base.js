const config = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  plugins: [
    "@typescript-eslint",
    "import",
    "react",
    "simple-import-sort",
    "sort-keys-fix",
  ],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
    "plugin:typescript-sort-keys/recommended",
  ],
  rules: {
    "import/no-mutable-exports": "error",
    "import/no-cycle": "error",
    "import/no-default-export": "error",
    "import/no-unresolved": "off",
    "import/no-duplicates": ["error", { "prefer-inline": true }],
    "import/namespace": ["off"],

    "newline-before-return": "error",
    "newline-after-var": "error",
    "nonblock-statement-body-position": "error",
    curly: "error",

    "react-hooks/exhaustive-deps": "off",
    "react/jsx-curly-brace-presence": "error",
    // allow {} even though it's unsafe but comes handy
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          "{}": false,
        },
      },
    ],

    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",

    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
        disallowTypeAnnotations: false,
      },
    ],

    // we allow empty interfaces
    "no-empty-pattern": "off",
    "@typescript-eslint/no-empty-interface": "off",

    // we allow empty functions
    "@typescript-eslint/no-empty-function": "off",

    // we sometimes use async functions that don't await anything
    "@typescript-eslint/require-await": "off",

    // make sure to `await` inside try…catch
    "@typescript-eslint/return-await": ["error", "in-try-catch"],

    // allow unused vars prefixed with `_`
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],

    // numbers and booleans are fine in template strings
    "@typescript-eslint/restrict-template-expressions": [
      "error",
      { allowNumber: true, allowBoolean: true },
    ],

    // @todo
    "@typescript-eslint/no-explicit-any": "off",

    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          // Side effect imports.
          ["^\\u0000"],

          // Node.js builtins prefixed with `node:`.
          ["^node:"],

          // Packages. Things that start with a letter (or digit or underscore)
          ["^@?\\w"],

          // @nimara imports
          ["^@nimara"],

          // Aliases
          ["^@/"],

          // Anything not matched in another group.
          ["^"],
          // Relative imports.
          // Anything that starts with a dot.
          ["^\\.*"],
        ],
      },
    ],
  },
  ignorePatterns: [
    "*.js",
    "*.jsx",
    "*.cjs",
    "src/checkout/graphql/*",
    "generated.ts",
    "tailwind.config.*",
  ],
};

module.exports = config;
