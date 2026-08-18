/** @type {import("eslint").Linter.Config} */
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
      // A page object is registered by one entry in codecept.conf.ts's `include`
      // map, which imports its default export. Base forbids default exports.
      files: ["codecept/**/*.ts", "codecept.conf.ts"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
};
