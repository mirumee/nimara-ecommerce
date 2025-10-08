import * as z from "zod";

export const productFeedItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  link: z.string().url(),
  price: z.number().nonnegative(),
  currency: z.string(),
  availability: z.enum(["in_stock", "out_of_stock"]),
  inventory_quantity: z.number(),
  image_link: z.string().url(),
  additional_image_link: z.array(z.string().url()).optional(),
  item_group_id: z.string(),
  item_group_title: z.string(),
  color: z.string().optional(),
  size: z.string().optional(),
  size_system: z.string().optional(),
  gender: z.string().optional(),
  offer_id: z.string(),
  brand: z.string().optional(),
  material: z.string().optional(),
  seller_name: z.string(),
  seller_url: z.string().url(),
});

export type ProductFeedItem = z.infer<typeof productFeedItemSchema>;

export const productFeedSchema = z.array(productFeedItemSchema);

export type ProductFeed = z.infer<typeof productFeedSchema>;
