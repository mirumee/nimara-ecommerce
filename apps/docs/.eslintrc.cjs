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
      files: ["**/*.{ts,tsx}"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
};
