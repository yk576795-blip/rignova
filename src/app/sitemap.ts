import { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BRAND.url;

  const staticPages = [
    "",
    "/shop",
    "/pc-builder",
    "/used-gpus",
    "/consoles",
    "/accessories",
    "/sell-gpu",
    "/warranty",
    "/about",
    "/contact",
    "/faq",
    "/blog",
    "/privacy",
    "/terms",
    "/refund-policy",
  ];

  return staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
