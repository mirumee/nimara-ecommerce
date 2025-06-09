module.exports = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  extends: ["custom/next"],
  root: true,
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  overrides: [
    {
      files: ["src/components/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/app"],
                message:
                  "Importing from @/app directory to @/components is forbidden. Consider moving code to @/components instead.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "warn",
          {
            patterns: [
              {
                group: ["@nimara/codegen"],
                message:
                  "Importing from Saleor schema directly is forbidden. Use the domain layer instead. To avoid coupling.",
              },
            ],
          },
        ],
      },
    },
  ],
};
