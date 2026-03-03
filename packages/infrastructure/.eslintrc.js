module.exports = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  extends: [require.resolve("@nimara/config/eslint/base")],
  root: true,
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
};
