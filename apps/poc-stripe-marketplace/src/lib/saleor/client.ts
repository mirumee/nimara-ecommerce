interface FetchAppIdInput {
  authToken: string;
  saleorApiUrl: string;
}

interface CheckoutCompleteInput {
  authToken: string;
  checkoutId: string;
  saleorApiUrl: string;
}

interface TransactionCreateInput {
  authToken: string;
  id: string;
  saleorApiUrl: string;
  transaction: {
    amountAuthorized?: {
      amount: number;
      currency: string;
    };
    amountCharged?: {
      amount: number;
      currency: string;
    };
    name: string;
    pspReference: string;
  };
  transactionEvent?: {
    message?: string;
    pspReference?: string;
  };
}

interface GetOrderTransactionsInput {
  authToken: string;
  orderId: string;
  saleorApiUrl: string;
}

interface OrderCancelInput {
  authToken: string;
  orderId: string;
  saleorApiUrl: string;
}

export interface CheckoutCompleteOrder {
  id: string;
  number: string;
  paymentStatus: string;
  status: string;
  total: {
    gross: {
      amount: number;
      currency: string;
    };
  };
}

export interface CheckoutCompleteError {
  code: string;
  field: string | null;
  message: string | null;
}

export interface CheckoutCompleteResult {
  errors: CheckoutCompleteError[];
  order: CheckoutCompleteOrder | null;
}

export interface TransactionCreateError {
  code: string;
  field: string | null;
  message: string | null;
}

export interface TransactionCreateResult {
  errors: TransactionCreateError[];
  transaction: {
    id: string;
    name: string;
  } | null;
}

export interface OrderTransaction {
  chargedAmount: {
    amount: number;
    currency: string;
  } | null;
  id: string;
  pspReference: string | null;
}

export interface OrderCancelError {
  code: string;
  field: string | null;
  message: string | null;
}

export interface OrderCancelResult {
  errors: OrderCancelError[];
  order: {
    id: string;
  } | null;
}

export async function fetchSaleorAppId({
  saleorApiUrl,
  authToken,
}: FetchAppIdInput): Promise<string | null> {
  const response = await fetch(saleorApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      query: `
        query AppId {
          app {
            id
          }
        }
      `,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    data?: { app?: { id?: string } };
  };

  return data.data?.app?.id ?? null;
}

export async function checkoutComplete({
  saleorApiUrl,
  authToken,
  checkoutId,
}: CheckoutCompleteInput): Promise<CheckoutCompleteResult> {
  const response = await fetch(saleorApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      query: `
        mutation CheckoutComplete($checkoutId: ID!) {
          checkoutComplete(id: $checkoutId) {
            order {
              id
              number
              status
              paymentStatus
              total {
                gross {
                  amount
                  currency
                }
              }
            }
            errors {
              field
              message
              code
            }
          }
        }
      `,
      variables: {
        checkoutId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Saleor request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as {
    data?: { checkoutComplete?: CheckoutCompleteResult | null };
    errors?: Array<{ message?: string }>;
  };

  if (data.errors?.length) {
    return {
      order: null,
      errors: data.errors.map((error) => ({
        field: null,
        message: error.message ?? "GraphQL error",
        code: "GRAPHQL_ERROR",
      })),
    };
  }

  const checkoutCompletePayload = data.data?.checkoutComplete;

  if (!checkoutCompletePayload) {
    return {
      order: null,
      errors: [
        {
          field: null,
          message: "Missing checkoutComplete payload.",
          code: "MISSING_PAYLOAD",
        },
      ],
    };
  }

  return checkoutCompletePayload;
}

export async function transactionCreate({
  saleorApiUrl,
  authToken,
  id,
  transaction,
  transactionEvent,
}: TransactionCreateInput): Promise<TransactionCreateResult> {
  const response = await fetch(saleorApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      query: `
        mutation TransactionCreate(
          $id: ID!
          $transaction: TransactionCreateInput!
          $transactionEvent: TransactionEventInput
        ) {
          transactionCreate(
            id: $id
            transaction: $transaction
            transactionEvent: $transactionEvent
          ) {
            transaction {
              id
              name
            }
            errors {
              field
              message
              code
            }
          }
        }
      `,
      variables: {
        id,
        transaction,
        transactionEvent,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Saleor request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as {
    data?: { transactionCreate?: TransactionCreateResult | null };
    errors?: Array<{ message?: string }>;
  };

  if (data.errors?.length) {
    return {
      transaction: null,
      errors: data.errors.map((error) => ({
        field: null,
        message: error.message ?? "GraphQL error",
        code: "GRAPHQL_ERROR",
      })),
    };
  }

  const payload = data.data?.transactionCreate;

  if (!payload) {
    return {
      transaction: null,
      errors: [
        {
          field: null,
          message: "Missing transactionCreate payload.",
          code: "MISSING_PAYLOAD",
        },
      ],
    };
  }

  return payload;
}

export async function getOrderTransactions({
  saleorApiUrl,
  authToken,
  orderId,
}: GetOrderTransactionsInput): Promise<OrderTransaction[]> {
  const response = await fetch(saleorApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      query: `
        query OrderTransactions($id: ID!) {
          order(id: $id) {
            transactions {
              id
              pspReference
              chargedAmount {
                amount
                currency
              }
            }
          }
        }
      `,
      variables: {
        id: orderId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Saleor request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as {
    data?: {
      order?: {
        transactions?: OrderTransaction[];
      } | null;
    };
    errors?: Array<{ message?: string }>;
  };

  if (data.errors?.length) {
    throw new Error(data.errors[0]?.message ?? "GraphQL error");
  }

  return data.data?.order?.transactions ?? [];
}

export async function orderCancel({
  saleorApiUrl,
  authToken,
  orderId,
}: OrderCancelInput): Promise<OrderCancelResult> {
  const response = await fetch(saleorApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      query: `
        mutation OrderCancel($id: ID!) {
          orderCancel(id: $id) {
            order {
              id
            }
            errors {
              field
              message
              code
            }
          }
        }
      `,
      variables: {
        id: orderId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Saleor request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as {
    data?: { orderCancel?: OrderCancelResult | null };
    errors?: Array<{ message?: string }>;
  };

  if (data.errors?.length) {
    return {
      order: null,
      errors: data.errors.map((error) => ({
        field: null,
        message: error.message ?? "GraphQL error",
        code: "GRAPHQL_ERROR",
      })),
    };
  }

  const payload = data.data?.orderCancel;

  if (!payload) {
    return {
      order: null,
      errors: [
        {
          field: null,
          message: "Missing orderCancel payload.",
          code: "MISSING_PAYLOAD",
        },
      ],
    };
  }

  return payload;
}
