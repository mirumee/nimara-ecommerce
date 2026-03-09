import { z } from "zod";

const metadataItemSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string(),
});

export const collectionCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .optional()
    .refine((val) => (val ? !/\s/.test(val) : true), {
      message: "Slug cannot contain spaces",
    }),
  description: z.string().optional().default(""),
  seo: z.object({
    title: z.string().optional().default(""),
    description: z.string().optional().default(""),
  }),
  metadata: z.array(metadataItemSchema).optional().default([]),
  privateMetadata: z.array(metadataItemSchema).optional().default([]),
  channelAvailability: z
    .record(
      z.string(),
      z.object({
        isPublished: z.boolean().default(false),
        publishedAt: z.string().optional().nullable(),
        setPublicationDate: z.boolean().optional().default(false),
      }),
    )
    .optional()
    .default({}),
});

export type CollectionCreateFormValues = z.infer<typeof collectionCreateSchema>;
