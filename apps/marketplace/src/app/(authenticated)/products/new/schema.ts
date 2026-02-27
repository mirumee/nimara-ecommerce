import { z } from "zod";

// Note: ProductCreate input expects EditorJS JSON string for description.
const selectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  disabled: z.boolean().optional(),
});

export const productCreateSchema = z.object({
  name: z.string().min(1, "Required"),
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

  // Media URLs (UI only for now; not submitted unless backend supports it)
  media: z
    .array(
      z.object({
        url: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),

  // Organize product - productTypeId is required for creation
  productTypeId: z.string().min(1, "Product type is required"),
  categoryId: z.string().optional().default(""),
  collectionIds: z.array(selectOptionSchema).optional().default([]),

  // Attributes: normalized in the client before sending mutation.
  // The schema stays permissive because attribute input types vary.
  attributes: z.record(z.string(), z.unknown()).optional().default({}),

  // Channel availability keyed by channelId.
  channelAvailability: z
    .record(
      z.string(),
      z.object({
        isPublished: z.boolean().default(false),
        isAvailableForPurchase: z.boolean().default(false),
        visibleInListings: z.boolean().default(false),
      }),
    )
    .optional()
    .default({}),

  // Shipping - only for products without variants
  weight: z
    .object({
      value: z.string().optional().default("0.00"),
      unit: z.string().optional().default("KG"), // Always KG, but kept in schema for consistency
    })
    .optional()
    .default({ value: "0.00", unit: "KG" }),

  // Pricing - only for products without variants
  channelListings: z
    .array(
      z.object({
        channelId: z.string(),
        price: z.string().optional(),
        costPrice: z.string().optional(),
      }),
    )
    .optional()
    .default([]),

  // Inventory - only for products without variants
  sku: z.string().optional().default(""),

  // Taxes
  taxClassId: z.string().optional().default(""),
});

export type ProductCreateFormValues = z.infer<typeof productCreateSchema>;
