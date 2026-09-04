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
      files: ["src/**/*.ts"],
      rules: {
        /**
         * `PORT` and `BUILD_TARGET` are declared by each consuming app, which
         * is where turbo can see them.
         */
        "turbo/no-undeclared-env-vars": [
          "error",
          { allowList: ["^PORT$", "^BUILD_TARGET$"] },
        ],
      },
    },
  ],
};
