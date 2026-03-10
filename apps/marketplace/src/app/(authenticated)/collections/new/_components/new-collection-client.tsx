"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

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

          setIsRedirecting(true);
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
                  <DialogTitle>Creating collection…</DialogTitle>
                </div>
                <DialogDescription>
                  You&apos;ll be redirected to the collection details once
                  it&apos;s ready.
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
