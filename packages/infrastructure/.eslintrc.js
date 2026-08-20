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
      files: ["src/lib/env/env.test.ts"],
      rules: {
        // Placeholder env keys created by the test, not Turbo task inputs.
        "turbo/no-undeclared-env-vars": [
          "error",
          { allowList: ["^FOO$", "^BAR$"] },
        ],
      },
    },
  ],
};
