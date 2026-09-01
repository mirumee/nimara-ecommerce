import { err, ok } from "@nimara/domain/objects/Result";

import type { NewsletterSubscribeInfra } from "#root/use-cases/newsletter/types";

import type { KlaviyoNewsletterServiceConfig } from "../../types";

const PROVIDER = "klaviyo";

const SUBSCRIBE_URL =
  "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs";

const API_REVISION = "2026-07-15";

const parseErrorCodes = (body: string | null) => {
  if (!body) {
    return null;
  }

  try {
    const parsed = JSON.parse(body) as {
      errors?: { code?: string; source?: { pointer?: string } }[];
    };

    return (
      parsed.errors?.map(({ code, source }) => ({
        code: code ?? null,
        pointer: source?.pointer ?? null,
      })) ?? null
    );
  } catch {
    return null;
  }
};

export const klaviyoNewsletterSubscribeInfra =
  ({
    listId,
    logger,
    privateApiKey,
    timeoutMs,
  }: KlaviyoNewsletterServiceConfig): NewsletterSubscribeInfra =>
  async ({ email }) => {
    const body = {
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email,
                  subscriptions: {
                    email: { marketing: { consent: "SUBSCRIBED" } },
                  },
                },
              },
            ],
          },
        },
        relationships: { list: { data: { type: "list", id: listId } } },
      },
    };

    let response: Response;

    try {
      response = await fetch(SUBSCRIBE_URL, {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${privateApiKey}`,
          revision: API_REVISION,
          accept: "application/vnd.api+json",
          "content-type": "application/vnd.api+json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      const timedOut = (error as { name?: string })?.name === "TimeoutError";

      logger.error("Newsletter subscribe did not reach Klaviyo.", {
        provider: PROVIDER,
        timedOut,
        reason: error instanceof Error ? error.message : String(error),
      });

      return err([
        timedOut
          ? {
              code: "NEWSLETTER_TIMEOUT_ERROR",
              message: `Klaviyo did not answer within ${timeoutMs}ms.`,
            }
          : {
              code: "NEWSLETTER_SUBSCRIBE_ERROR",
              message: "The request to Klaviyo failed.",
            },
      ]);
    }

    const responseBody = await response.text().catch(() => null);

    if (!response.ok) {
      logger.error("Klaviyo rejected the newsletter subscribe request.", {
        provider: PROVIDER,
        status: response.status,
        errors: parseErrorCodes(responseBody),
      });

      return err([
        {
          code: "NEWSLETTER_SUBSCRIBE_ERROR",
          message: `Klaviyo answered ${response.status}.`,
          status: response.status,
        },
      ]);
    }

    return ok({ acknowledged: true });
  };
