import {
  type ConfigFormInput,
  configFormSchema as baseConfigFormSchema,
} from "@/apps/handler/api/rest/app/schema";
import { type ConfigFormData } from "@/use-cases/get-config-form-data-use-case";

const SECRET_KEY_REQUIRED = "Enter the secret key.";

/**
 * A blank secret key means "keep the stored one", so whether it may be blank
 * depends on whether this channel has one — which the form knows only from the
 * fetched config. The API repeats the check; this one puts it on the field.
 */
export const configFormSchema = (config: ConfigFormData["config"]) =>
  baseConfigFormSchema.superRefine((values: ConfigFormInput, context) => {
    const missingSecretKey = (stored: string | undefined, entered?: string) =>
      !stored && !entered;

    if (missingSecretKey(config.default?.secretKey, values.default.secretKey)) {
      context.addIssue({
        code: "custom",
        message: SECRET_KEY_REQUIRED,
        path: ["default", "secretKey"],
      });
    }

    Object.entries(values.channelOverrides ?? {}).forEach(
      ([slug, override]) => {
        if (
          missingSecretKey(
            config.channelOverrides[slug]?.secretKey,
            override.secretKey,
          )
        ) {
          context.addIssue({
            code: "custom",
            message: SECRET_KEY_REQUIRED,
            path: ["channelOverrides", slug, "secretKey"],
          });
        }
      },
    );
  });
