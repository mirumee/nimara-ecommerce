import { type SaleorWebhookHeaders } from "../saleor/headers";
import { type WebhookData } from "../saleor/webhooks/types";

export type Handler<T extends { event: unknown }> = (opts: {
  event: WebhookData<T>;
  headers: SaleorWebhookHeaders;
  request: Request;
}) => Response | Promise<Response>;

type RouteFactory<T extends { event: unknown }> = (
  handler: Handler<T>,
) => Handler<T>;

export const chain = <T extends { event: unknown }>(
  functions: RouteFactory<T>[],
  index = 0,
): Handler<T> => {
  const current = functions[index];

  if (current) {
    const next = chain(functions, index + 1);

    return current(next);
  }

  return current;
  // return (
  //   request: NextRequest,
  //   event: NextFetchEvent,
  //   response: NextResponse,
  // ) => {
  //   return response;
  // };
};
