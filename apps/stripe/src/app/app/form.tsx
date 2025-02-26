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
import { type ParamsOf } from "@/lib/types";

import { fetchDataAction } from "./actions/fetch-data-action";
import { saveDataAction } from "./actions/save-data-action";
import { type Schema, schema } from "./schema";

export const ConfigForm = () => {
  const { appBridgeState } = useAppBridge();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues({
      accessToken: appBridgeState!.token!,
      domain: appBridgeState!.domain,
    }),
  });

  const handleSubmit: SubmitHandler<Schema> = async (data) => {
    const error = await saveDataAction({
      data,
      accessToken: appBridgeState!.token!,
      saleorDomain: appBridgeState!.domain,
    });

    if (error) {
      toast({ description: error, variant: "destructive" });
    } else {
      toast({ description: "Configuration saved successfully." });

      form.reset(
        await getDefaultValues({
          accessToken: appBridgeState!.token!,
          domain: appBridgeState!.domain,
        })(),
      );
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
    </Form>
  );
};

// Server actions must be async thus a simple wrapper fn.
const getDefaultValues = (opts: ParamsOf<typeof fetchDataAction>) => async () =>
  fetchDataAction(opts);
