import * as z from "zod";

const buyerSchema = z.object({
  first_name: z.string().min(1, "First name cannot be empty"),
  last_name: z.string().min(1, "Last name cannot be empty"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
});

export type Buyer = z.infer<typeof buyerSchema>;

/**
 * Schema representing a postal address.
 * @link https://developers.openai.com/commerce/specs/checkout#address
 */
const addressSchema = z.object({
  /**
   * Name of the person to whom the items are shipped.
   */
  name: z.string().min(1, "Name cannot be empty").max(256, "Name is too long"),
  /**
   * First line of address
   */
  line_one: z
    .string()
    .min(1, "Line one cannot be empty")
    .max(60, "Line one is too long"),
  /**
   * Optional second line of address
   */
  line_two: z
    .string()
    .min(1, "Line two cannot be empty")
    .max(60, "Line two is too long")
    .optional(),
  /**
   * Address city/district/suburb/town/village.
   */
  city: z.string().min(1, "City cannot be empty").max(60, "City is too long"),
  /**
   * State, province, or region. Optional depending on the country.
   * Should follow the ISO 3166-1 standard.
   */
  state: z.string().min(1, "State cannot be empty").max(3, "State is too long"),
  /**
   * Address country. Should follow the ISO 3166-1 standard
   */
  country: z.string().min(1, "Country cannot be empty"),
  /**
   * Address postal code or zip code
   */
  postal_code: z
    .string()
    .min(1, "Postal code cannot be empty")
    .max(20, "Postal code is too long"),
  /**
   * Optional phone number. Follows the E.164 standard
   */
  phone_number: z.string().min(1, "Phone number cannot be empty").optional(),
});

export type FulfillmentAddress = z.infer<typeof addressSchema>;

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

const itemSchema = z.object({
  id: z.string().min(1, "Id cannot be empty"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const paymentDataSchema = z.object({
  token: z.string().min(1, "Payment token cannot be empty"),
  provider: z.enum(["stripe"]), // Extendable for other providers
  billing_address: addressSchema.required(),
});

export const checkoutSessionCompleteSchema = z.object({
  buyer: buyerSchema.optional(),
  payment_data: paymentDataSchema.required(),
});

export type CheckoutSessionCompleteSchema = z.infer<
  typeof checkoutSessionCompleteSchema
>;
export type CheckoutSessionCompleteInput = z.infer<
  typeof checkoutSessionCompleteSchema
>;

export const checkoutSessionCreateSchema = z.object({
  buyer: buyerSchema.optional(),
  fulfillment_address: addressSchema.optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

export type CheckoutSessionCreateSchema = z.infer<
  typeof checkoutSessionCreateSchema
>;

export const checkoutSessionUpdateSchema = z.object({
  buyer: buyerSchema.optional(),
  fulfillment_address: addressSchema.optional(),
  fulfillment_option_id: z
    .string()
    .min(1, "Fulfillment option ID cannot be empty")
    .optional(),
  items: z.array(itemSchema).optional(),
});

const lineItemSchema = z.object({
  id: z.string().min(1, "Id cannot be empty"),
  item: itemSchema,
  base_amount: z.number().min(0, "Base amount cannot be negative"),
  discount: z.number().min(0, "Discount cannot be negative"),
  subtotal: z.number().min(0, "Subtotal cannot be negative"),
  tax: z.number().min(0, "Tax cannot be negative"),
  total: z.number().min(0, "Total cannot be negative"),
});

export type CheckoutSessionUpdateInput = z.infer<
  typeof checkoutSessionUpdateSchema
>;

const TOTAL_TYPES = [
  "discount",
  "fee",
  "fulfillment",
  "items_base_amount",
  "items_discount",
  "subtotal",
  "tax",
  "total",
] as const;

/**
 * Schema representing a total line in the checkout session.
 * @see TOTAL_TYPES for valid types.
 * @link https://developers.openai.com/commerce/specs/checkout#total
 */
const totalSchema = z.object({
  type: z.enum(TOTAL_TYPES),
  display_text: z.string().min(1, "Display text cannot be empty"),
  amount: z.number().min(0, "Amount cannot be negative"),
});

export type Totals = z.infer<typeof totalSchema>;

export const CHECKOUT_SESSION_STATUSES = [
  "not_ready_for_payment",
  "ready_for_payment",
  "completed",
  "canceled",
] as const;

export type CheckoutSessionStatus = (typeof CHECKOUT_SESSION_STATUSES)[number];

/**
 * Schema representing a payment provider and its supported payment methods.
 * @link https://developers.openai.com/commerce/specs/checkout#paymentprovider
 */
export const paymentProviderSchema = z.object({
  provider: z.enum(["stripe"]),
  supported_payment_methods: z.array(z.enum(["card"])),
});

export type PaymentProvider = z.infer<typeof paymentProviderSchema>;

export const linkSchema = z.object({
  type: z.enum(["terms_of_use", "privacy_policy", "seller_shop_policies"]),
  url: z.string().url(),
});

export const checkoutSessionSchema = z.object({
  id: z.string().min(1, "Id cannot be empty"),
  status: z.enum([
    "not_ready_for_payment",
    "ready_for_payment",
    "completed",
    "canceled",
  ]),
  line_items: z.array(lineItemSchema),
  buyer: buyerSchema.nullable(),
  fulfillment_address: addressSchema.nullable(),
  fulfillment_options: z.array(fulfillmentOptionSchema),
  fulfillment_option_id: z.string().nullable(),
  currency: z.string(),
  totals: z.array(totalSchema).nullable(),
  messages: z.array(messageSchema),
  payment_provider: paymentProviderSchema,
  link: z.array(linkSchema),
});

export type CheckoutSession = z.infer<typeof checkoutSessionSchema>;

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
