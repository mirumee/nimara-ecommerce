"use server";

import { revalidatePath } from "next/cache";

import { getServerAuthToken } from "@/lib/auth/server";
import { collectionsService } from "@/services";

import type { CollectionCreateFormValues } from "./schema";

function toEditorJsJSONString(plainText: string): string {
  const blocks = plainText
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({ type: "paragraph", data: { text } }));

  return JSON.stringify({
    time: Date.now(),
    blocks,
    version: "2.28.2",
  });
}

export async function createCollection(
  values: CollectionCreateFormValues,
  channels: Array<{ id: string }>,
) {
  const token = await getServerAuthToken();

  const result = await collectionsService.createCollection(
    {
      input: {
        name: values.name,
        slug: values.slug || null,
        description: toEditorJsJSONString(values.description ?? ""),
      },
    },
    token,
  );

  if (!result.ok) {
    return {
      ok: false as const,
      id: null,
      errors: result.errors.map(
        (e: { message?: string }) => e.message ?? "Unknown error",
      ),
    };
  }

  const createErrors = result.data.collectionCreate?.errors ?? [];

  if (createErrors.length > 0) {
    return {
      ok: false as const,
      id: null,
      errors: createErrors.map((e) => e.message).filter(Boolean),
    };
  }

  const collection = result.data.collectionCreate?.collection;

  if (!collection?.id) {
    return {
      ok: false as const,
      id: null,
      errors: ["No collection returned"],
    };
  }

  revalidatePath("/collections");

  const updateChannels: Array<{
    channelId: string;
    isPublished: boolean;
    publishedAt?: string | null;
  }> = [];

  for (const channel of channels) {
    const config = values.channelAvailability?.[channel.id];

    if (!config) {
      continue;
    }

    // If Hidden is selected but publication date is set, treat as scheduled visibility
    const hasScheduledPublication =
      !config.isPublished && config.setPublicationDate && config.publishedAt;

    if (config.isPublished || hasScheduledPublication) {
      let publishedAt: string | null = null;

      if (
        (config.setPublicationDate || hasScheduledPublication) &&
        config.publishedAt
      ) {
        // Convert datetime-local format to ISO string
        const dateValue = new Date(config.publishedAt);

        if (!isNaN(dateValue.getTime())) {
          publishedAt = dateValue.toISOString();
        }
      }

      updateChannels.push({
        channelId: channel.id,
        isPublished: true,
        publishedAt,
      });
    } else {
      // Keep channel listing but mark as unpublished (hidden)
      // This ensures the channel is counted in the list view
      updateChannels.push({
        channelId: channel.id,
        isPublished: false,
        publishedAt: null,
      });
    }
  }

  if (updateChannels.length > 0) {
    const channelResult =
      await collectionsService.updateCollectionChannelListing(
        {
          id: collection.id,
          input: {
            addChannels: updateChannels,
          },
        },
        token,
      );

    if (!channelResult.ok) {
      revalidatePath(`/collections/${collection.id}`);

      return {
        ok: true as const,
        id: collection.id,
        errors: channelResult.errors.map(
          (e: { message?: string }) => e.message ?? "Channel update failed",
        ),
      };
    }
  }

  revalidatePath(`/collections/${collection.id}`);

  return { ok: true as const, id: collection.id };
}
