module.exports = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  extends: [require.resolve("@nimara/config/eslint/next")],
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
  ],
};
