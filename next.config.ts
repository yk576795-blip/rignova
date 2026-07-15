import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `standalone` is for Docker/self-hosted. Vercel handles bundling itself — remove it.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
    ],
  },
  // Silence the `punycode` deprecation from pg on Node 22+
  serverExternalPackages: ["pg"],
};

export default nextConfig;
