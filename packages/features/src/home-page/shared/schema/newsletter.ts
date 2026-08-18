import { z } from "zod";

import { type GetTranslations } from "@nimara/i18n/types";

/**
 * What the form hands the server. Consent is a boolean on the wire; the server
 * narrows it with {@link grantedSubmissionSchema} before anything leaves the
 * storefront.
 */
export const submissionSchema = z.object({
  consent: z.boolean(),
  email: z.string().trim().email(),
  name: z.string().trim().min(1),
});

export type Submission = z.infer<typeof submissionSchema>;

/**
 * The server-side gate. The action re-validates against this because it is a
 * public endpoint — the client-side resolver below is a courtesy.
 */
export const grantedSubmissionSchema = submissionSchema.extend({
  consent: z.literal(true),
});

export const formSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t("form-validation.required") }),
    email: z
      .string()
      .email({ message: t("form-validation.invalid-email") })
      .trim(),
    consent: z.boolean().refine((isGranted) => isGranted, {
      message: t("newsletter.consent-required"),
    }),
  });

export type FormSchema = z.infer<ReturnType<typeof formSchema>>;
