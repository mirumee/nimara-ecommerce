module.exports = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  extends: ["custom/base.js"],
  root: true,
  ignorePatterns: ["schema.ts"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
};
