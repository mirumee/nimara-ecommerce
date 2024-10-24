import { type MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const publicUrl = process.env.BASE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/_vercel/"],
      },
    ],
    sitemap: `${publicUrl}/sitemap.xml`,
  };
}
