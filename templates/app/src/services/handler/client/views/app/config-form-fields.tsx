import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  type SubmitHandler,
  useForm,
  useWatch,
} from "react-hook-form";

import { useDashboardSession } from "@nimara/lib/client/saleor/dashboard-session/context";
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
} from "@/services/handler/api/rest/app/schema";
import { type ConfigFormData } from "@/use-cases/get-config-form-data-use-case";

import { saveConfigData } from "./api";
import { ChannelList } from "./components/channel-list";
import { ConfigFields } from "./components/config-fields";
import { DefaultChannelSelect } from "./components/default-channel-select";

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
  data,
  reload,
}: {
  data: ConfigFormData;
  reload: () => void;
}) => {
  const { accessToken, saleorApiUrl } = useDashboardSession();
  const { toast } = useToast();

  const form = useForm<ConfigFormInput, unknown, ConfigFormSchema>({
    resolver: zodResolver(configFormSchema),
    defaultValues: toFormValues(data),
  });

  const defaultChannelSlug = useWatch<ConfigFormInput, "defaultChannelSlug">({
    control: form.control,
    name: "defaultChannelSlug",
  });

  const handleSubmit: SubmitHandler<ConfigFormSchema> = async (values) => {
    const error = await saveConfigData({
      accessToken,
      data: values,
      saleorApiUrl,
    });

    if (error) {
      toast({ description: error, variant: "destructive" });

      return;
    }

    toast({ description: "Configuration saved." });
    reload();
  };

  if (!data.channels.length) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No channels to configure</AlertTitle>
        <AlertDescription>
          This Saleor has no channels, so there is nothing to attach keys to.
          Create a channel in Saleor, then reload.
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
              The channel the keys are entered on. Every other channel inherits
              them until it is given keys of its own.
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
                Override a channel to give it keys of its own. An override
                replaces both keys — a channel never mixes keys from two
                configs.
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
