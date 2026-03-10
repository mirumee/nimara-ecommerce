"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormProvider, type Resolver, useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Label } from "@nimara/ui/components/label";
import { useToast } from "@nimara/ui/hooks";

import { InputField } from "@/components/fields/input-field";
import {
  type Channel,
  ChannelAvailabilitySection,
} from "@/components/product-availability-section";
import { Textarea } from "@/components/ui/textarea";

import { createCollection } from "../actions";
import {
  type CollectionCreateFormValues,
  collectionCreateSchema,
} from "../schema";

type Props = {
  channels: Channel[];
};

export function NewCollectionClient({ channels }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

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
    resolver: zodResolver(
      collectionCreateSchema,
    ) as Resolver<CollectionCreateFormValues>,
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
            title: t("marketplace.collections.new.toast-failed"),
            description:
              (result.errors ?? []).join(", ") ||
              t("common.toast-unknown-error"),
            variant: "destructive",
          });

          return;
        }

        if (result.id) {
          if (result.errors?.length) {
            toast({
              title: t("marketplace.collections.new.toast-created"),
              description: t(
                "marketplace.collections.new.toast-created-channel-warning",
              ),
              variant: "destructive",
            });
          } else {
            toast({
              title: t("marketplace.collections.new.toast-created"),
              description: t(
                "marketplace.collections.new.toast-created-success",
              ),
            });
          }

          setIsRedirecting(true);
          router.push(`/collections/${result.id}`);
          router.refresh();
        }
      } catch (error) {
        toast({
          title: t("marketplace.collections.new.toast-failed"),
          description:
            error instanceof Error
              ? error.message
              : t("common.toast-unknown-error"),
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
        title: t("marketplace.shared.toast-validation-error"),
        description:
          errorMessages.length > 0
            ? errorMessages.join(", ")
            : t("marketplace.shared.toast-check-fields"),
        variant: "destructive",
      });
    },
  );

  const isSubmitting = form.formState.isSubmitting;
  const isLoading = isSubmitting || isRedirecting;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <div className="min-h-screen">
          <Dialog open={isLoading}>
            <DialogContent withCloseButton={false} className="w-full max-w-sm">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <DialogTitle>
                    {t("marketplace.collections.new.creating-dialog-title")}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  {t("marketplace.collections.new.creating-dialog-description")}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <div className="fixed left-0 right-0 top-16 z-40 border-b bg-background">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href="/collections">
                    <ArrowLeft className="h-4 w-4" />
                    {t("marketplace.collections.new.back-to-collections")}
                  </Link>
                </Button>
                <h1 className="text-2xl font-semibold">
                  {t("marketplace.collections.new.title")}
                </h1>
              </div>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {t("marketplace.collections.new.create-button")}{" "}
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
                    <CardTitle>
                      {t("marketplace.collections.new.general-info-title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <InputField label={t("common.name")} name="name" />
                    <div className="grid gap-2">
                      <Label>
                        {t("marketplace.collections.new.field-description")}
                      </Label>
                      <Textarea
                        {...form.register("description")}
                        placeholder={t(
                          "marketplace.collections.new.field-description-placeholder",
                        )}
                        rows={7}
                        disabled={isSubmitting}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex grow basis-1/3 flex-col gap-4">
                <ChannelAvailabilitySection
                  variant="collection"
                  channels={channels}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
