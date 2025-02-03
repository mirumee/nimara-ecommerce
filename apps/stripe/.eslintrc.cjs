module.exports = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  extends: ["custom/next"],
  root: true,
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
};
