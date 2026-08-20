import { zodResolver } from "@hookform/resolvers/zod";
import { use } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";

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
  configFormSchema,
} from "@/apps/handler/api/rest/app/schema";
import { type ConfigFormData } from "@/use-cases/get-config-form-data-use-case";

import { useDashboardSession } from "../../../components/dashboard-session/context";
import { saveConfigData } from "../api";
import { ChannelList } from "./channel-list";
import { ConfigFields } from "./config-fields";

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
});

export const ConfigFormFields = ({
  getConfig,
  reload,
}: {
  getConfig: Promise<ConfigFormData>;
  reload: () => void;
}) => {
  const { accessToken, saleorDomain } = useDashboardSession();
  const { toast } = useToast();
  const data = use(getConfig);

  const form = useForm<ConfigFormInput, unknown, ConfigFormSchema>({
    resolver: zodResolver(configFormSchema),
    defaultValues: toFormValues(data),
  });

  const handleSubmit: SubmitHandler<ConfigFormSchema> = async (values) => {
    const error = await saveConfigData({
      data: values,
      accessToken,
      saleorDomain,
    });

    if (error) {
      toast({ description: error, variant: "destructive" });

      return;
    }

    toast({ description: "Configuration saved successfully." });

    // Saving mints the webhook endpoint and resolves the account id.
    reload();
  };

  const { defaultChannelSlug } = data.config;
  const defaultChannel = data.channels.find(
    ({ slug }) => slug === defaultChannelSlug,
  );

  if (!defaultChannel) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Default channel not found</AlertTitle>
        <AlertDescription>
          This Saleor has no channel with the slug{" "}
          <code>{defaultChannelSlug}</code>. Point{" "}
          <code>DEFAULT_CHANNEL_SLUG</code> at an existing channel and reload.
        </AlertDescription>
      </Alert>
    );
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <Card>
          <CardHeader>
            <CardTitle>{defaultChannel.name}</CardTitle>
            <CardDescription>
              {defaultChannel.slug} · {defaultChannel.currency}
            </CardDescription>
            <CardDescription>
              The default channel every other channel inherits config from until
              it is given its own.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConfigFields
              config={data.config.default ?? undefined}
              disabled={isSubmitting}
              name="default"
            />
          </CardContent>
        </Card>

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

        <div className="flex justify-end">
          <Button loading={isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
