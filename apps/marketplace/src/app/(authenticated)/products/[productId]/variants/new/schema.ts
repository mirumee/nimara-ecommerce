import { z } from "zod";

export const variantCreateSchema = z.object({
  name: z.string().min(1, "Required"),
  sku: z.string().optional().default(""),
  trackInventory: z.boolean().default(false),
  weight: z.object({
    value: z.string().optional().default("0.00"),
    unit: z.string().optional().default("KG"),
  }),

  attributes: z.record(z.string(), z.unknown()).optional().default({}),

  channelListings: z
    .array(
      z.object({
        channelId: z.string(),
        isAvailableForPurchase: z.boolean().default(false),
        price: z.string().optional(),
        costPrice: z.string().optional(),
        priorPrice: z.string().optional(),
        preorderThreshold: z.number().optional(),
      }),
    )
    .optional()
    .default([]),

  stocks: z
    .record(
      z.string(),
      z.object({
        isAssigned: z.boolean().default(false),
        warehouseName: z.string(),
        quantity: z.string().optional().default("0"),
      }),
    )
    .optional()
    .default({}),
});

export type VariantCreateFormValues = z.infer<typeof variantCreateSchema>;
