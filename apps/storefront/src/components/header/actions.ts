"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { paths } from "@/lib/paths";

const searchFormSchema = z.object({ query: z.string().default("") });

export const performSearch = async (formData: FormData) => {
  const parsedFormData = searchFormSchema.parse(Object.fromEntries(formData));

  redirect(paths.search.asPath({ query: { q: parsedFormData.query } }));
};
