module.exports = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  extends: ["custom/base.js"],
  overrides: [
    {
      files: ["*.tsx"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
  root: true,
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
};
