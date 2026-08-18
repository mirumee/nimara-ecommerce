module.exports = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  extends: [require.resolve("@nimara/config/eslint/base")],
  root: true,
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  overrides: [
    {
      files: ["src/lib/zod/util.test.ts"],
      rules: {
        // This key is created by the test and is not a Turbo task input.
        "turbo/no-undeclared-env-vars": ["error", { allowList: ["^ENV_KEY$"] }],
      },
    },
    {
      files: ["vite.config.ts", "vitest.config.ts", "etc/*.ts"],
      rules: {
        // Vite/Vitest expect a default-exported config; PORT is dev-only.
        "import/no-default-export": "off",
        "turbo/no-undeclared-env-vars": ["error", { allowList: ["^PORT$"] }],
      },
    },
    {
      files: ["src/apps/*/client-entry-point.ts"],
      rules: {
        // import.meta.env.DEV is vite's flag, not a Turbo task input.
        "turbo/no-undeclared-env-vars": ["error", { allowList: ["^DEV$"] }],
      },
    },
  ],
};
