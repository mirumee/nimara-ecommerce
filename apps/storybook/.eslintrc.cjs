module.exports = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  extends: ["custom/base.js"],
  root: true,
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
};
