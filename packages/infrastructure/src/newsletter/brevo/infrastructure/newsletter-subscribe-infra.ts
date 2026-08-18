import {
  type BaseError,
  type NewsletterErrorCode,
} from "@nimara/domain/objects/Error";
import { err, ok } from "@nimara/domain/objects/Result";
import { type NonEmptyArray } from "@nimara/domain/objects/types";

import type { NewsletterSubscribeInfra } from "#root/use-cases/newsletter/types";

import type { BrevoNewsletterServiceConfig } from "../../types";

/**
 * Brevo sends the confirmation email itself and only adds the contact to the
 * configured lists once the recipient confirms, so double opt-in is a property
 * of this endpoint rather than an account setting.
 */
const DOI_ENDPOINT =
  "https://api.brevo.com/v3/contacts/doubleOptinConfirmation";

/** Brevo attributes that must already exist in the account before it accepts values. */
const CONSENT_AT_ATTRIBUTE = "CONSENT_AT";
const CONSENT_URL_ATTRIBUTE = "CONSENT_URL";

const ADDRESS_REJECTED_CODES = new Set([
  "invalid_parameter",
  "missing_parameter",
  "out_of_range",
]);

const QUOTA_CODES = new Set(["not_enough_credits", "account_under_validation"]);

/**
 * A contact already on the list is the outcome the shopper asked for, and the
 * response must not say which of the two happened — otherwise the public form
 * answers "is this address subscribed?" for any address.
 */
const ALREADY_PRESENT_CODES = new Set([
  "duplicate_parameter",
  "duplicate_request",
]);

type Outcome = "accepted" | NewsletterErrorCode;

const failure = (
  code: NewsletterErrorCode,
  message: string,
): NonEmptyArray<BaseError> => [{ code, message }];

const resolveTemplateId = (
  templateIds: BrevoNewsletterServiceConfig["templateIds"],
  locale: string,
) =>
  templateIds[locale] ??
  templateIds[locale.split("-")[0]] ??
  templateIds.default;

/**
 * Request fields a `400` can be about. Recognising which one Brevo named is the
 * whole diagnostic: `email` is the shopper's problem, everything else is the
 * operator's misconfiguration, and the two need different answers.
 */
const KNOWN_FIELDS = [
  "email",
  "includeListIds",
  "excludeListIds",
  "templateId",
  "redirectionUrl",
  "attributes",
  CONSENT_AT_ATTRIBUTE,
  CONSENT_URL_ATTRIBUTE,
  "FIRSTNAME",
] as const;

type BrevoError = { code: string | null; field: string | null };

/**
 * Reads the machine-readable `code` and matches `message` against
 * {@link KNOWN_FIELDS}, returning only the field name that matched. The message
 * itself is never returned, logged, or attached to an error: Brevo echoes the
 * submitted contact in it, so emitting it would put a subscriber's address in a
 * log line or a captured exception.
 */
const readError = async (response: Response): Promise<BrevoError> => {
  try {
    const body = (await response.json()) as {
      code?: unknown;
      message?: unknown;
    };
    const haystack =
      typeof body.message === "string" ? body.message.toLowerCase() : "";

    return {
      code: typeof body.code === "string" ? body.code : null,
      field:
        KNOWN_FIELDS.find((candidate) =>
          haystack.includes(candidate.toLowerCase()),
        ) ?? null,
    };
  } catch {
    return { code: null, field: null };
  }
};

const classify = (status: number, { code, field }: BrevoError): Outcome => {
  if (code && ALREADY_PRESENT_CODES.has(code)) {
    return "accepted";
  }

  if (code && QUOTA_CODES.has(code)) {
    return "NEWSLETTER_QUOTA_EXCEEDED_ERROR";
  }

  if (status === 402 || status === 429) {
    return "NEWSLETTER_QUOTA_EXCEEDED_ERROR";
  }

  /**
   * Only a `400` about the address is the shopper's to act on. The submission
   * schema already validated the address, so a `400` naming a list, template,
   * redirect or attribute is the deployment's configuration — telling the
   * shopper to check what they typed would send them to fix someone else's
   * mistake, forever.
   */
  if (status === 400 && code && ADDRESS_REJECTED_CODES.has(code)) {
    return field === "email"
      ? "NEWSLETTER_ADDRESS_REJECTED_ERROR"
      : "NEWSLETTER_PROVIDER_UNAVAILABLE_ERROR";
  }

  return "NEWSLETTER_PROVIDER_UNAVAILABLE_ERROR";
};

export const brevoNewsletterSubscribeInfra =
  ({
    apiKey,
    listIds,
    templateIds,
    redirectUrl,
    timeoutMs,
    logger,
  }: BrevoNewsletterServiceConfig): NewsletterSubscribeInfra =>
  async ({ email, name, locale, consent }) => {
    const startedAt = Date.now();

    /**
     * Observability carries the outcome, never the subscriber: an address is
     * personal data whether it is in a log line or a captured exception, and a
     * hash of it identifies the same person.
     */
    const report = (outcome: Outcome, context: object = {}) =>
      logger.info("Newsletter subscribe finished", {
        provider: "brevo",
        outcome,
        durationMs: Date.now() - startedAt,
        ...context,
      });

    let response: Response;

    try {
      response = await fetch(DOI_ENDPOINT, {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          email,
          includeListIds: listIds,
          templateId: resolveTemplateId(templateIds, locale),
          redirectionUrl: redirectUrl,
          attributes: {
            ...(name ? { FIRSTNAME: name } : {}),
            [CONSENT_AT_ATTRIBUTE]: consent.consentedAt,
            [CONSENT_URL_ATTRIBUTE]: consent.privacyPolicyUrl,
          },
        }),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
    } catch (error) {
      // The request is abandoned, not retried: Brevo may have accepted it and
      // already sent the confirmation email. The shopper's own resubmission is
      // the retry, which is safe because a duplicate resolves to success.
      report("NEWSLETTER_PROVIDER_UNAVAILABLE_ERROR", {
        reason: error instanceof Error ? error.name : "unknown",
      });

      return err(
        failure(
          "NEWSLETTER_PROVIDER_UNAVAILABLE_ERROR",
          `Brevo did not answer within ${timeoutMs}ms or was unreachable.`,
        ),
      );
    }

    if (response.ok) {
      report("accepted", { providerStatus: response.status });

      return ok("CONFIRMATION_PENDING");
    }

    const providerError = await readError(response);
    const outcome = classify(response.status, providerError);

    report(outcome, {
      providerStatus: response.status,
      providerCode: providerError.code,
      providerField: providerError.field,
    });

    if (outcome === "accepted") {
      return ok("CONFIRMATION_PENDING");
    }

    return err(
      failure(
        outcome,
        `Brevo rejected the subscription with ${response.status} ${providerError.code ?? "no code"} on ${providerError.field ?? "an unnamed field"}.`,
      ),
    );
  };
