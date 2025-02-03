"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { type SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import { Form, FormDescription } from "@nimara/ui/components/form";
import { TextFormField } from "@nimara/ui/components/textFormField";
import { useToast } from "@nimara/ui/hooks";

import { Spinner } from "@/components/spinner";
import { isEmptyObject } from "@/lib/misc";

import { fetchDataAction } from "./actions/fetch-data-action";
import { saveDataAction } from "./actions/save-data-action";
import { type Schema, schema } from "./schema";

export const ConfigForm = () => {
  const { appBridgeState } = useAppBridge();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: fetchDefaultValues({
      accessToken: appBridgeState!.token!,
      domain: appBridgeState!.domain,
    }),
  });

  const handleSubmit: SubmitHandler<Schema> = async (data) => {
    const error = await saveDataAction({
      data,
      accessToken: appBridgeState!.token!,
      domain: appBridgeState!.domain,
    });

    if (error) {
      toast({ description: error, variant: "destructive" });
    } else {
      toast({ description: "Configuration saved successfully." });
    }
  };

  const data = form.getValues();

  return (
    <Form {...form}>
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
                    label="Private API Key"
                  >
                    <FormDescription>Stripe private API key.</FormDescription>
                  </TextFormField>

                  <TextFormField
                    name={`${channelSlug}.publicKey`}
                    label="Public API Key"
                  >
                    <FormDescription>
                      Stripe publishable API key.
                    </FormDescription>
                  </TextFormField>

                  <TextFormField
                    name={`${channelSlug}.webhookId`}
                    label="Webhook Id"
                    disabled
                  >
                    <FormDescription>
                      Unique identifier for the webhook endpoint object.
                    </FormDescription>
                  </TextFormField>
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
    </Form>
  );
};

const fetchDefaultValues =
  ({ accessToken, domain }: { accessToken: string; domain: string }) =>
  async () => {
    const data = await fetchDataAction({
      accessToken,
      domain,
    });

    const x = data.reduce<Schema>((acc, { channel, paymentGatewayConfig }) => {
      acc[channel.slug] = {
        currency: channel.currencyCode,
        name: channel.name,
        webhookId: paymentGatewayConfig.webhookId,
        publicKey: paymentGatewayConfig.publicKey,
        secretKey: paymentGatewayConfig.secretKey,
      };

      return acc;
    }, {});

    return x;
  };
