const config = {
  projects: {
    saleor: {
      schema: process.env.NEXT_PUBLIC_SALEOR_API_URL,
      documents: "**/*.graphql",
    },
  },
};

export default config;
