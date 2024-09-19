module.exports = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  extends: ["custom/base", "plugin:playwright/recommended"],
  root: true,
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  overrides: [
    {
      files: ["tests/e2e/**/*.spec.{ts,tsx}"],
      rules: {
        // Both rules are disabled temporarily, since we're preparing the infra for the tests
        "playwright/no-skipped-test": "off",
        "playwright/expect-expect": "off",
      },
    },
  ],
};
