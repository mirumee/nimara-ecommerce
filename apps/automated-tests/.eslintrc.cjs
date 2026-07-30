/** @type {import("eslint").Linter.Config} */
module.exports = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  extends: [
    require.resolve("@nimara/config/eslint/base"),
    "plugin:playwright/recommended",
  ],
  root: true,
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  overrides: [
    {
      // CodeceptJS trial. The playwright plugin's rules assume Playwright's
      // test/expect API and misfire on Feature()/Scenario() files.
      // See docs/adr/0001-codeceptjs-spike.md.
      files: ["codecept/**/*.ts", "codecept.conf.ts"],
      extends: [require.resolve("@nimara/config/eslint/base")],
      rules: {
        "playwright/no-standalone-expect": "off",
        "playwright/expect-expect": "off",
        "playwright/no-conditional-in-test": "off",
        "import/no-default-export": "off",
      },
    },
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
