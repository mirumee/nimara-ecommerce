import { type MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const environment = process.env.VERCEL_ENV;

  if (environment === "production") {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/", "/_next/", "/_vercel/"],
        },
      ],
      sitemap: `${process.env.BASE_URL}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}
