"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

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
const channels = [
  {
    name: "Channel UK",
    slug: "channel-uk",
    currency: "GBP",
  },
  {
    name: "Channel US",
    slug: "channel-us",
    currency: "USD",
  },
];

const schema = z.record(
  z.string(),
  z.object({
    currency: z.string(),
    apiKey: z.string(),
    webhookId: z.string().optional(),
  }),
);

type Schema = z.infer<typeof schema>;

export const ConfigForm = () => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: channels.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.slug]: {
          currency: curr.currency,
          apiKey: "",
          webhookId: "",
        },
      };
    }, {}),
  });

  const handleSubmit: SubmitHandler<Schema> = async ({ data }) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-y-[inherit]"
      >
        {channels.map(({ slug, name }) => (
          <Card key={slug}>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <CardDescription>{slug}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-4">
                <TextFormField
                  disabled
                  name={`${slug}.currency`}
                  label="Currency"
                >
                  <FormDescription>
                    Currency from the current channel.
                  </FormDescription>
                </TextFormField>

                <TextFormField name={`${slug}.apiKey`} label="API Key">
                  <FormDescription>Stripe private API key.</FormDescription>
                </TextFormField>

                <TextFormField
                  name={`${slug}.webhookId`}
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
        ))}
        <Button
          className="my-4 w-full"
          type="submit"
          form="create-account-form"
        >
          Save
        </Button>
      </form>
    </Form>
  );
};
