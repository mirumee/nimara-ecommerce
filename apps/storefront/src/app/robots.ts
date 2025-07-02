import { type MetadataRoute } from "next";

import { clientEnvs } from "@/envs/client";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/_vercel/"],
      },
    ],
    sitemap: new URL(
      "sitemap.xml",
      clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
    ).toString(),
  };
}
