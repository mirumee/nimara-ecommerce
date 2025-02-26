import { CONFIG } from "@/config";
import {
  PaymentGatewayInitializeSessionSubscriptionDocument,
  TransactionCancelationRequestedSubscriptionDocument,
  TransactionChargeRequestedSubscriptionDocument,
  TransactionInitializeSessionSubscriptionDocument,
  TransactionProcessSessionSubscriptionDocument,
  TransactionRefundRequestedSubscriptionDocument,
} from "@/graphql/subscriptions/generated";
import { getRequestOrigin } from "@/lib/http/request";
import { type SaleorAppManifest } from "@/lib/saleor/types";

export async function GET(request: Request) {
  const host = getRequestOrigin(request);

  const manifest: SaleorAppManifest = {
    id: CONFIG.APP_ID,
    version: CONFIG.VERSION,
    name: CONFIG.APP_ID,
    permissions: ["HANDLE_PAYMENTS"],
    tokenTargetUrl: `${host}/api/saleor/register`,
    appUrl: `${host}/app`,
    webhooks: [
      {
        query: PaymentGatewayInitializeSessionSubscriptionDocument.toString(),
        name: "PaymentGatewayInitializeSession",
        targetUrl: `${host}/api/saleor/webhooks/payment/gateway-initialize-session`,
        syncEvents: ["PAYMENT_GATEWAY_INITIALIZE_SESSION"],
        asyncEvents: [],
      },
      {
        query: TransactionInitializeSessionSubscriptionDocument.toString(),
        name: "TransactionInitializeSession",
        targetUrl: `${host}/api/saleor/webhooks/payment/transaction-initialize-session`,
        syncEvents: ["TRANSACTION_INITIALIZE_SESSION"],
        asyncEvents: [],
      },
      {
        query: TransactionProcessSessionSubscriptionDocument.toString(),
        name: "TransactionProcessSession",
        targetUrl: `${host}/api/saleor/webhooks/payment/transaction-process-session`,
        syncEvents: ["TRANSACTION_PROCESS_SESSION"],
        asyncEvents: [],
      },
      {
        query: TransactionChargeRequestedSubscriptionDocument.toString(),
        name: "TransactionChargeRequested",
        targetUrl: `${host}/api/saleor/webhooks/payment/transaction-charge-requested`,
        syncEvents: ["TRANSACTION_CHARGE_REQUESTED"],
        asyncEvents: [],
      },
      {
        query: TransactionCancelationRequestedSubscriptionDocument.toString(),
        name: "TransactionCancelationRequested",
        targetUrl: `${host}/api/saleor/webhooks/payment/transaction-cancelation-requested`,
        syncEvents: ["TRANSACTION_CANCELATION_REQUESTED"],
        asyncEvents: [],
      },
      {
        query: TransactionRefundRequestedSubscriptionDocument.toString(),
        name: "TransactionRefundRequested",
        targetUrl: `${host}/api/saleor/webhooks/payment/transaction-refund-requested`,
        syncEvents: ["TRANSACTION_REFUND_REQUESTED"],
        asyncEvents: [],
      },
    ],
  };

  return Response.json(manifest);
}
