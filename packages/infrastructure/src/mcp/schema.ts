import * as z from "zod";

const buyerSchema = z.object({
  first_name: z.string().min(1, "First name cannot be empty"),
  last_name: z.string().min(1, "Last name cannot be empty"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number cannot be empty").optional(),
});

const fulfillmentAddressSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  line_one: z.string().min(1, "Line one cannot be empty").optional(),
  line_two: z.string().min(1, "Line two cannot be empty").optional(),
  city: z.string().min(1, "City cannot be empty").optional(),
  state: z.string().min(1, "State cannot be empty").optional(),
  country: z.string().min(1, "Country cannot be empty").optional(),
  postal_code: z.string().min(1, "Postal code cannot be empty").optional(),
});

const fulfillmentOptionSchema = z.object({
  type: z.enum(["shipping", "pickup"]),
  id: z.string().min(1, "Id cannot be empty"),
  title: z.string().min(1, "Title cannot be empty"),
  subtitle: z.string().min(1, "Subtitle cannot be empty").optional(),
  carrier: z.string().min(1, "Carrier cannot be empty").optional(),
  earliest_delivery_time: z.string().optional(),
  latest_delivery_time: z.string().optional(),
  subtotal: z.number().min(0, "Subtotal cannot be negative"),
  tax: z.number().min(0, "Tax cannot be negative"),
  total: z.number().min(0, "Total cannot be negative"),
});

const messageSchema = z.object({
  type: z.enum(["error", "warning", "info"]),
  code: z.string().min(1, "Code cannot be empty"),
  path: z.string().min(1, "Path cannot be empty"),
  content_type: z.string().min(1, "Content type cannot be empty"),
  content: z.string().min(1, "Content cannot be empty"),
});

const itemCreateSchema = z.object({
  id: z.string().min(1, "Id cannot be empty"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const checkoutSessionCreateSchema = z.object({
  buyer: buyerSchema.optional(),
  fulfillment_address: fulfillmentAddressSchema.optional(),
  items: z.array(itemCreateSchema).min(1, "At least one item is required"),
});

export const checkoutSessionSchema = z.object({
  id: z.string().min(1, "Id cannot be empty"),
  status: z.enum([
    "not_ready_for_payment",
    "ready_for_payment",
    "completed",
    "canceled",
  ]),
  line_items: z
    .array(
      itemCreateSchema.extend({
        id: z.string().min(1, "Id cannot be empty"),
      }),
    )
    .min(1, "At least one item is required"),
  buyer: buyerSchema.nullable(),
  fulfillment_options: z.array(fulfillmentOptionSchema),
  currency: z.string(),
  totals: z.array(z.object({})).nullable(),
  messages: z.array(messageSchema),
});

export const checkoutSession = {
  id: "cs_12345",
  status: "not_ready_for_payment",
  line_items: [
    {
      id: "item_1",
      quantity: 2,
    },
  ],
  currency: "usd",
  buyer: {
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
  },
  messages: [],
  fulfillment_options: [],
  totals: null,
} satisfies CheckoutSession;

export type CheckoutSessionCreateSchema = z.infer<
  typeof checkoutSessionCreateSchema
>;
export type CheckoutSession = z.infer<typeof checkoutSessionSchema>;
