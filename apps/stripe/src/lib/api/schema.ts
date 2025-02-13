import { z } from "zod";

export const responseSchema = z.object({
  description: z.string(),
  errors: z
    .array(z.object({ message: z.string(), code: z.string().optional() }))
    .default([]),
});

export type ResponseSchema = z.infer<typeof responseSchema>;
