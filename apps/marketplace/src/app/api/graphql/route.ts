import { createYoga } from "graphql-yoga";
import { type NextRequest, type NextResponse } from "next/server";

import { authorizeGraphQLContext } from "@/lib/graphql/server/auth";
import { getStitchedSchema } from "@/lib/graphql/server/schema";
import type { ServerContext } from "@/lib/saleor/types";

let yogaInstance: ReturnType<typeof createYoga<ServerContext>> | null = null;

async function getYogaInstance() {
  if (!yogaInstance) {
    const schema = await getStitchedSchema();

    yogaInstance = createYoga<ServerContext>({
      schema,
      graphqlEndpoint: "/api/graphql",
      cors: false, // CORS handled by Next.js config
      landingPage: false,
      graphiql: {
        defaultQuery: "\n",
        title: "Marketplace Vendor Panel GraphQL",
        shouldPersistHeaders: true,
      },
      context: async ({ request, params }) => {
        const context = await authorizeGraphQLContext(
          request,
          params.operationName,
          params.query,
        );


return context;
      },
      plugins: [
        // Proxy cookies from Saleor to client
        {
          onResponse({ response, serverContext }) {
            const ctx = serverContext as unknown as ServerContext;

            if (ctx?.proxiedCookies?.length) {
              for (const cookie of ctx.proxiedCookies) {
                response.headers.append("Set-Cookie", cookie);
              }
            }
          },
        },
      ],
    });
  }

  return yogaInstance;
}

export async function GET(request: NextRequest) {
  const yoga = await getYogaInstance();


return yoga.fetch(request) as Promise<NextResponse>;
}

export async function POST(request: NextRequest) {
  const yoga = await getYogaInstance();


return yoga.fetch(request) as Promise<NextResponse>;
}

export async function OPTIONS(request: NextRequest) {
  const yoga = await getYogaInstance();


return yoga.fetch(request) as Promise<NextResponse>;
}
