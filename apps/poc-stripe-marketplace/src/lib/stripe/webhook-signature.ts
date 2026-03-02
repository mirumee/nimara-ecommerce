import { createHmac, timingSafeEqual } from "crypto";

import { CONFIG } from "@/config";

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

export const verifyStripeWebhookSignature = ({
  payload,
  stripeSignature,
}: {
  payload: string;
  stripeSignature: string;
}) => {
  const { timestamp, signatures } = parseStripeSignature(stripeSignature);

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const timestampNumber = Number(timestamp);

  if (!Number.isFinite(timestampNumber)) {
    return false;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (Math.abs(currentTimestamp - timestampNumber) > WEBHOOK_TOLERANCE_SECONDS) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = createHmac(
    "sha256",
    CONFIG.STRIPE_WEBHOOK_SIGNING_SECRET,
  )
    .update(signedPayload, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  return signatures.some((signature) => {
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
};
