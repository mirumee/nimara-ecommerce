import { zodResolver } from "@hookform/resolvers/zod";
import { use } from "react";
import {
  FormProvider,
  type SubmitHandler,
  useForm,
  useWatch,
} from "react-hook-form";

import { useDashboardSession } from "@nimara/lib/client/dashboard-session/context";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@nimara/ui/components/alert";
import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import { useToast } from "@nimara/ui/hooks";

import {
  type ConfigFormInput,
  type ConfigFormSchema,
} from "@/apps/handler/api/rest/app/schema";
import { type ConfigFormData } from "@/use-cases/get-config-form-data-use-case";

import { saveConfigData } from "../api";
import { configFormSchema } from "../config-form-schema";
import { ChannelList } from "./channel-list";
import { ConfigFields } from "./config-fields";
import { DefaultChannelSelect } from "./default-channel-select";

/**
 * Secret keys arrive masked, so the field starts blank and a blank field keeps
 * the stored key. Seeding it would save the mask as the key.
 */
const toFormValues = ({ config }: ConfigFormData): ConfigFormInput => ({
  channelOverrides: Object.fromEntries(
    Object.entries(config.channelOverrides).map(([slug, { publicKey }]) => [
      slug,
      { publicKey, secretKey: "" },
    ]),
  ),
  default: {
    publicKey: config.default?.publicKey ?? "",
    secretKey: "",
  },
  defaultChannelSlug: config.defaultChannelSlug ?? "",
});

export const ConfigFormFields = ({
  getConfig,
  reload,
}: {
  getConfig: Promise<ConfigFormData>;
  reload: () => void;
}) => {
  const { accessToken, saleorApiUrl } = useDashboardSession();
  const { toast } = useToast();
  const data = use(getConfig);

  const form = useForm<ConfigFormInput, unknown, ConfigFormSchema>({
    resolver: zodResolver(configFormSchema(data.config)),
    defaultValues: toFormValues(data),
  });

  const defaultChannelSlug = useWatch<ConfigFormInput, "defaultChannelSlug">({
    control: form.control,
    name: "defaultChannelSlug",
  });

  const handleSubmit: SubmitHandler<ConfigFormSchema> = async (values) => {
    const error = await saveConfigData({
      data: values,
      accessToken,
      saleorApiUrl,
    });

    if (error) {
      toast({ description: error, variant: "destructive" });

      return;
    }

    toast({ description: "Configuration saved successfully." });

    // Saving mints the webhook endpoint and resolves the account id.
    reload();
  };

  if (!data.channels.length) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No channels to configure</AlertTitle>
        <AlertDescription>
          This Saleor has no channels, so there is nothing to attach Stripe keys
          to. Create a channel in Saleor, then reload.
        </AlertDescription>
      </Alert>
    );
  }

  const defaultChannel = data.channels.find(
    ({ slug }) => slug === defaultChannelSlug,
  );
  const isSubmitting = form.formState.isSubmitting;

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <Card>
          <CardHeader>
            <CardTitle>Default channel</CardTitle>
            <CardDescription>
              The channel the Stripe keys are entered on. Every other channel
              inherits them until it is given keys of its own.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <DefaultChannelSelect
              channels={data.channels}
              disabled={isSubmitting}
            />

            {defaultChannel && (
              <ConfigFields
                config={data.config.default ?? undefined}
                disabled={isSubmitting}
                name="default"
              />
            )}
          </CardContent>
        </Card>

        {defaultChannel && (
          <Card>
            <CardHeader>
              <CardTitle>Other channels</CardTitle>
              <CardDescription>
                Override a channel to settle its payments through a different
                Stripe account. An override replaces both keys — a channel never
                mixes keys from two accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChannelList
                channels={data.channels.filter(
                  ({ slug }) => slug !== defaultChannelSlug,
                )}
                defaultChannelName={defaultChannel.name}
                disabled={isSubmitting}
                overrides={data.config.channelOverrides}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button loading={isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
