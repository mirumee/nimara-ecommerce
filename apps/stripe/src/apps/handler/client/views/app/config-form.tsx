import { zodResolver } from "@hookform/resolvers/zod";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import { FormDescription } from "@nimara/ui/components/form";
import { TextFormField } from "@nimara/ui/components/textFormField";
import { useToast } from "@nimara/ui/hooks";

import { type ConfigFormSchema, configFormSchema } from "@/apps/handler/api/rest/app/schema";
import { isEmptyObject } from "@/lib/misc";
import { saleorDomainFromApiUrl } from "@/lib/saleor/url";

import { Spinner } from "../../components/spinner";
import { fetchConfigData, saveConfigData } from "./api";

export const ConfigForm = () => {
  const { appBridgeState } = useAppBridge();
  const { toast } = useToast();
  const accessToken = appBridgeState!.token!;
  const saleorDomain = saleorDomainFromApiUrl(appBridgeState!.saleorApiUrl);

  const form = useForm({
    resolver: zodResolver(configFormSchema),
    defaultValues: () => fetchConfigData({ accessToken, saleorDomain }),
  });

  const handleSubmit: SubmitHandler<ConfigFormSchema> = async (data) => {
    const error = await saveConfigData({
      data,
      accessToken,
      saleorDomain,
    });

    if (error) {
      toast({ description: error, variant: "destructive" });
    } else {
      toast({ description: "Configuration saved successfully." });

      form.reset(await fetchConfigData({ accessToken, saleorDomain }));
    }
  };

  const data = form.getValues();

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-y-[inherit]"
      >
        {form.formState.isLoading ? (
          <Spinner />
        ) : (
          Object.entries(data).map(([channelSlug, { name }]) => (
            <Card key={channelSlug}>
              <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{channelSlug}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col gap-4">
                  <TextFormField
                    disabled
                    name={`${channelSlug}.currency`}
                    label="Currency"
                  >
                    <FormDescription>
                      Currency from the current channel.
                    </FormDescription>
                  </TextFormField>

                  <TextFormField
                    name={`${channelSlug}.secretKey`}
                    label="Private API key"
                    disabled={form.formState.isSubmitting}
                  ></TextFormField>

                  <TextFormField
                    name={`${channelSlug}.publicKey`}
                    label="Public API key"
                    disabled={form.formState.isSubmitting}
                  ></TextFormField>

                  <TextFormField
                    name={`${channelSlug}.webhookId`}
                    label="Webhook id"
                    disabled
                  ></TextFormField>

                  <TextFormField
                    name={`${channelSlug}.webhookSecretKey`}
                    label="Webhook secret key"
                    disabled
                  ></TextFormField>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        <Button
          loading={form.formState.isSubmitting}
          disabled={isEmptyObject(data) || form.formState.isSubmitting}
          className="my-4 w-full"
          type="submit"
        >
          Save
        </Button>
      </form>
    </FormProvider>
  );
};
