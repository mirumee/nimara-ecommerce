import {
  GROUP_SHARE_METADATA_KEY_PATTERN,
  StripeMetaKey,
  type TransactionAction,
  type TransactionEventType,
} from "./consts";

export type GroupShare = {
  amount: number;
  transactionId: string;
};

const GROUP_SHARE_VALUE_PATTERN = /^(.+)\|(\d+)$/;

const GROUP_SHARE_EVENT_TYPES: ReadonlySet<TransactionEventType> = new Set([
  "CHARGE_SUCCESS",
  "CHARGE_REQUEST",
  "CHARGE_FAILURE",
  "CANCEL_SUCCESS",
]);

export const isPaymentGroup = (metadata: Record<string, string>) =>
  metadata[StripeMetaKey.PAYMENT_GROUP] === "1";

export const isGroupShareEventType = (type: TransactionEventType) =>
  GROUP_SHARE_EVENT_TYPES.has(type);

export const getGroupShareAvailableActions = (
  type: TransactionEventType,
): TransactionAction[] => (type === "CHARGE_SUCCESS" ? ["REFUND"] : []);

const parseGroupShare = (value: string): GroupShare | null => {
  const match = GROUP_SHARE_VALUE_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const amount = Number(match[2]);

  return amount > 0 ? { transactionId: match[1], amount } : null;
};

export const parseGroupShares = (
  metadata: Record<string, string>,
): GroupShare[] | null => {
  const shares = Object.entries(metadata)
    .filter(([key]) => GROUP_SHARE_METADATA_KEY_PATTERN.test(key))
    .map(([, value]) => parseGroupShare(value));

  if (!shares.length || shares.some((share) => share === null)) {
    return null;
  }

  const validShares = shares as GroupShare[];
  const transactionIds = new Set(
    validShares.map(({ transactionId }) => transactionId),
  );

  return transactionIds.size === validShares.length ? validShares : null;
};

export const sumGroupShares = (shares: GroupShare[]) =>
  shares.reduce((total, { amount }) => total + amount, 0);

export const toGroupShareMetadata = (shares: GroupShare[]) => ({
  [StripeMetaKey.PAYMENT_GROUP]: "1",
  ...Object.fromEntries(
    shares.map(({ amount, transactionId }, index) => [
      `tx_${index}`,
      `${transactionId}|${amount}`,
    ]),
  ),
});

export const findGroupShare = ({
  metadata,
  transactionId,
}: {
  metadata: Record<string, string>;
  transactionId: string;
}) =>
  parseGroupShares(metadata)?.find(
    (share) => share.transactionId === transactionId,
  ) ?? null;

export type GroupCheckout = {
  authorizeStatus: string;
  channelSlug: string;
  chargeStatus: string;
  currency: string;
  email: string | null;
  totalCents: number;
  transactions: {
    actionRequiredCents: number[];
    chargedCents: number;
    createdByAppId: string | null;
    id: string;
    pspReference: string;
  }[];
  userId: string | null;
};

const normalizeEmail = (email: string | null) => email?.toLowerCase() ?? null;

export const getGroupMemberRefusal = ({
  appId,
  checkout,
  leader,
  transactionId,
}: {
  appId: string;
  checkout: GroupCheckout;
  leader: GroupCheckout;
  transactionId?: string;
}): string | null => {
  if (
    checkout.channelSlug !== leader.channelSlug ||
    checkout.currency !== leader.currency
  ) {
    return "Payment group checkouts must share a channel and currency.";
  }

  if (
    checkout.userId !== leader.userId ||
    normalizeEmail(checkout.email) !== normalizeEmail(leader.email)
  ) {
    return "Payment group checkouts must belong to the same customer.";
  }

  if (checkout.chargeStatus !== "NONE" || checkout.authorizeStatus !== "NONE") {
    return "A payment group checkout is already paid.";
  }

  if (transactionId === undefined) {
    return null;
  }

  const transaction = checkout.transactions.find(
    ({ id }) => id === transactionId,
  );

  if (!transaction || transaction.createdByAppId !== appId) {
    return "A payment group transaction is missing.";
  }

  if (transaction.pspReference || transaction.chargedCents > 0) {
    return "A payment group transaction is already used.";
  }

  if (!transaction.actionRequiredCents.includes(checkout.totalCents)) {
    return "A payment group transaction does not match its checkout total.";
  }

  return null;
};
