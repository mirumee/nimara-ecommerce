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
