import { createHmac, timingSafeEqual } from "crypto";

const WEBHOOK_TOLERANCE_SECONDS = 300;

const parseStripeSignature = (signature: string) => {
  const parts = signature.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  return {
    timestamp,
    signatures,
  };
};

export type StripeWebhookVerifyFailureReason =
  | "malformed_header_missing_timestamp_or_v1"
  | "invalid_timestamp_number"
  | "timestamp_outside_tolerance"
  | "missing_signing_secret"
  | "signature_mismatch";

export type StripeWebhookVerifyResult =
  | { ok: true }
  | {
      /** Seconds between Stripe header timestamp and server time (absolute), if parsed */
      clockSkewSeconds?: number;
      ok: false;
      reason: StripeWebhookVerifyFailureReason;
    };

/**
 * Same as verifyStripeWebhookSignature but returns why verification failed (for debugging).
 */
export const verifyStripeWebhookSignatureDetailed = ({
  payload,
  stripeSignature,
}: {
  payload: string;
  stripeSignature: string;
}): StripeWebhookVerifyResult => {
  const { timestamp, signatures } = parseStripeSignature(stripeSignature);

  if (!timestamp || signatures.length === 0) {
    return { ok: false, reason: "malformed_header_missing_timestamp_or_v1" };
  }

  const timestampNumber = Number(timestamp);

  if (!Number.isFinite(timestampNumber)) {
    return { ok: false, reason: "invalid_timestamp_number" };
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const clockSkewSeconds = Math.abs(currentTimestamp - timestampNumber);

  if (clockSkewSeconds > WEBHOOK_TOLERANCE_SECONDS) {
    return {
      clockSkewSeconds,
      ok: false,
      reason: "timestamp_outside_tolerance",
    };
  }

  const signedPayload = `${timestamp}.${payload}`;
  const secret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

  if (!secret) {
    return { ok: false, reason: "missing_signing_secret" };
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  const matched = signatures.some((signature) => {
    try {
      const signatureBuffer = Buffer.from(signature, "hex");

      if (signatureBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch {
      return false;
    }
  });

  if (!matched) {
    return {
      clockSkewSeconds,
      ok: false,
      reason: "signature_mismatch",
    };
  }

  return { ok: true };
};

export const verifyStripeWebhookSignature = ({
  payload,
  stripeSignature,
}: {
  payload: string;
  stripeSignature: string;
}) => {
  const result = verifyStripeWebhookSignatureDetailed({
    payload,
    stripeSignature,
  });

  return result.ok;
};
