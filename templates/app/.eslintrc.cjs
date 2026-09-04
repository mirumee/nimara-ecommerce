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
      files: [
        "src/services/*/client/**/*.{ts,tsx}",
        "src/services/*/entry-client.tsx",
      ],
      env: { browser: true },
    },
    {
      files: [
        "vite.config.ts",
        "vitest.config.ts",
        "etc/*.ts",
        "tailwind.config.ts",
      ],
      rules: {
        // Vite/Vitest expect a default-exported config; PORT is dev-only.
        "import/no-default-export": "off",
        "turbo/no-undeclared-env-vars": ["error", { allowList: ["^PORT$"] }],
      },
    },
  ],
};
