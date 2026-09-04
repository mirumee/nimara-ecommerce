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
      files: ["src/zod/util.test.ts"],
      rules: {
        // This key is created by the test and is not a Turbo task input.
        "turbo/no-undeclared-env-vars": ["error", { allowList: ["^ENV_KEY$"] }],
      },
    },
    {
      files: ["src/client/**/*.{ts,tsx}", "src/hono/html-shell.ts"],
      rules: {
        // `DEV` is vite's own flag, not a Turbo task input.
        "turbo/no-undeclared-env-vars": ["error", { allowList: ["^DEV$"] }],
      },
    },
    {
      files: ["vitest.config.ts"],
      rules: {
        // Vitest expects a default-exported config.
        "import/no-default-export": "off",
      },
    },
  ],
};
