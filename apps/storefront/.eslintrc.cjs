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
  ],
};
