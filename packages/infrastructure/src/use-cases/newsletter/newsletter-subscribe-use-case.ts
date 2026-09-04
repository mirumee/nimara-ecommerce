import { z } from "zod";

import { FIELD_MAX_LENGTH } from "@nimara/domain/consts";
import { err } from "@nimara/domain/objects/Result";

import type {
  NewsletterSubscribeInfra,
  NewsletterSubscribeUseCase,
} from "./types";

const emailSchema = z.string().trim().max(FIELD_MAX_LENGTH.email).email();

export const newsletterSubscribeUseCase =
  ({
    newsletterSubscribeInfra,
  }: {
    newsletterSubscribeInfra: NewsletterSubscribeInfra;
  }): NewsletterSubscribeUseCase =>
  async ({ email }) => {
    const parsed = emailSchema.safeParse(email);

    if (!parsed.success) {
      return err([{ code: "INVALID_VALUE_ERROR", field: "email" }]);
    }

    return newsletterSubscribeInfra({ email: parsed.data });
  };
