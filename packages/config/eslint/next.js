const config = {
  $schema: "https://json.schemastore.org/eslintrc.json",
  extends: ["next/core-web-vitals", "./base"],
  rules: {
    "@next/next/no-html-link-for-pages": ["error", "apps/storefront/src"],
  },
  overrides: [
    {
      files: [
        "src/app/**/{page,layout,error,loading,not-found,global-error}.tsx",
        "*.ts",
      ],
      rules: {
        "import/no-default-export": "off",
      },
    },
    {
      files: ["src/checkout/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "off",
          {
            patterns: [
              {
                group: ["next/*", "@next/*", "next"],
                message:
                  "Usage of Next.js-specific imports inside src/checkout is forbidden. Checkout is a standalone component and should not depend on Next.js.",
              },
            ],
          },
        ],
      },
    },
  ],
  ignorePatterns: ["*.js", "*.jsx", "*.cjs", "src/checkout/graphql/*"],
};

module.exports = config;
