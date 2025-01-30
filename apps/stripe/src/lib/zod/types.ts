import type { z } from "zod";

export type AnyZodSchema =
  | z.ZodIntersection<any, any>
  | z.ZodEffects<any>
  | z.AnyZodObject;
