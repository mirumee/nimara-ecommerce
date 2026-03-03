/** @type {import("eslint").Linter.Config} */
module.exports = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  extends: [require.resolve("@nimara/config/eslint/base")],
  root: true,
  ignorePatterns: ["schema.ts"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
};
