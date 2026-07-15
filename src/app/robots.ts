import { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/vendor/", "/api/", "/dashboard/"],
    },
    sitemap: `${BRAND.url}/sitemap.xml`,
  };
}
