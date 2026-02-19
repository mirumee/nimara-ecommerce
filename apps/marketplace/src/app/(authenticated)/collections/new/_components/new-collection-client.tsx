"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@nimara/ui/components/radio-group";
import { useToast } from "@nimara/ui/hooks";

import { CheckboxField } from "@/components/fields/checkbox-field";
import { InputField } from "@/components/fields/input-field";
import { Textarea } from "@/components/ui/textarea";

import { createCollection } from "../actions";
import {
  type CollectionCreateFormValues,
  collectionCreateSchema,
} from "../schema";

type Channel = {
  currencyCode: string;
  id: string;
  name: string;
};

function AvailabilitySection({ channels }: { channels: Channel[] }) {
  const { watch, setValue, register } =
    useFormContext<CollectionCreateFormValues>();
  const channelAvailability = watch("channelAvailability") ?? {};
  // Count all channels that have availability configured (both published and hidden)
  // Since all channels are shown in the Availability section, count all of them
  const configuredCount = channels.length;

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) {
      return "";
    }
    try {
      const date = new Date(dateString);

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>
          In {configuredCount} out of {channels.length} channels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {channels.map((channel) => {
          const isPublished =
            channelAvailability[channel.id]?.isPublished ?? false;
          const publishedAt = channelAvailability[channel.id]?.publishedAt;
          const hasPublicationDate = Boolean(publishedAt);
          const visibleLabel = hasPublicationDate
            ? `Visible since ${formatDate(publishedAt)}`
            : "Visible";

          return (
            <div key={channel.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="font-medium">{channel.name}</div>
                <div className="text-xs text-muted-foreground">
                  {channel.currencyCode}
                </div>
              </div>
              <div className="space-y-3">
                <RadioGroup
                  value={isPublished ? "visible" : "hidden"}
                  onValueChange={(value) => {
                    setValue(
                      `channelAvailability.${channel.id}.isPublished`,
                      value === "visible",
                    );
                    if (value === "visible") {
                      setValue(
                        `channelAvailability.${channel.id}.publishedAt`,
                        undefined,
                      );
                      setValue(
                        `channelAvailability.${channel.id}.setPublicationDate`,
                        false,
                      );
                    }
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="visible"
                      id={`${channel.id}-visible`}
                    />
                    <Label
                      htmlFor={`${channel.id}-visible`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {visibleLabel}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="hidden"
                      id={`${channel.id}-hidden`}
                    />
                    <Label
                      htmlFor={`${channel.id}-hidden`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      Hidden
                    </Label>
                  </div>
                </RadioGroup>
                {!isPublished && (
                  <div className="flex items-center space-x-2">
                    <CheckboxField
                      name={`channelAvailability.${channel.id}.setPublicationDate`}
                      label="Set publication date"
                    />
                  </div>
                )}
                {!isPublished &&
                  watch(
                    `channelAvailability.${channel.id}.setPublicationDate`,
                  ) && (
                    <div className="grid gap-2">
                      <Label
                        htmlFor={`${channel.id}-publishedAt`}
                        className="text-sm"
                      >
                        Publication date
                      </Label>
                      <Input
                        type="datetime-local"
                        id={`${channel.id}-publishedAt`}
                        {...register(
                          `channelAvailability.${channel.id}.publishedAt`,
                        )}
                        defaultValue={new Date().toISOString().slice(0, 16)}
                        onChange={(e) => {
                          setValue(
                            `channelAvailability.${channel.id}.publishedAt`,
                            e.target.value,
                          );
                        }}
                      />
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

type Props = {
  channels: Channel[];
};

export function NewCollectionClient({ channels }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const defaultChannelAvailability = Object.fromEntries(
    channels.map((ch) => [
      ch.id,
      {
        isPublished: false,
        publishedAt: undefined as string | undefined,
        setPublicationDate: false,
      },
    ]),
  );

  const form = useForm<CollectionCreateFormValues>({
    resolver: zodResolver(collectionCreateSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      seo: {
        title: "",
        description: "",
      },
      metadata: [],
      privateMetadata: [],
      channelAvailability: defaultChannelAvailability,
    },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit(
    async (values) => {
      try {
        const result = await createCollection(values, channels);

        if (!result.ok) {
          toast({
            title: "Failed to create collection",
            description: (result.errors ?? []).join(", ") || "Unknown error",
            variant: "destructive",
          });

          return;
        }

        if (result.id) {
          if (result.errors?.length) {
            toast({
              title: "Collection created",
              description:
                "Channel visibility could not be updated. You can edit it here.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Collection created",
              description: "Collection has been created successfully.",
            });
          }
          router.push(`/collections/${result.id}`);
          router.refresh();
        }
      } catch (error) {
        toast({
          title: "Failed to create collection",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    },
    (errors) => {
      // Handle validation errors
      const errorMessages = Object.entries(errors)
        .map(([field, error]) => {
          const errorObj = error as { message?: string } | undefined;

          if (errorObj?.message) {
            return `${field}: ${errorObj.message}`;
          }

          return null;
        })
        .filter((msg): msg is string => msg !== null);

      toast({
        title: "Validation error",
        description:
          errorMessages.length > 0
            ? errorMessages.join(", ")
            : "Please check the form fields",
        variant: "destructive",
      });
    },
  );

  const isSubmitting = form.formState.isSubmitting;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <div className="min-h-screen">
          <div className="fixed left-0 right-0 top-16 z-40 border-b bg-background">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href="/collections">
                    <ArrowLeft className="h-4 w-4" />
                    All collections
                  </Link>
                </Button>
                <h1 className="text-2xl font-semibold">Add Collection</h1>
              </div>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                Create{" "}
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-20 px-6 pb-6">
            <div className="flex w-full gap-4">
              <div className="flex grow basis-2/3 flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <InputField label="Name" name="name" />
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        {...form.register("description")}
                        placeholder="Description"
                        rows={7}
                        disabled={isSubmitting}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex grow basis-1/3 flex-col gap-4">
                <AvailabilitySection channels={channels} />
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
