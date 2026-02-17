import "dotenv/config";
import { GraphQLClient } from "graphql-request";

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const SALEOR_APP_TOKEN = process.env.SALEOR_APP_TOKEN;

if (!SALEOR_API_URL || !SALEOR_APP_TOKEN) {
  console.error(
    "[SEEDING] Missing environment variables: NEXT_PUBLIC_SALEOR_API_URL or SALEOR_APP_TOKEN",
  );
  process.exit(1);
}

/**
 * GraphQL client for Saleor API.
 */
export const client = new GraphQLClient(SALEOR_API_URL, {
  headers: {
    Authorization: `Bearer ${SALEOR_APP_TOKEN}`,
  },
});
