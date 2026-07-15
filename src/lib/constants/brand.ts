export const BRAND = {
  name: "RigNova",
  tagline: "Build Beyond Limits",
  description:
    "Premium gaming hardware e-commerce platform for custom PCs, components, used GPUs, and gaming accessories.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://rignova.in",
  email: "hello@rignova.in",
  phone: "+91 98765 43210",
  address: "Cyber Hub, Sector 24, Gurugram, Haryana 122002",
  social: {
    instagram: "https://instagram.com/rignova",
    twitter: "https://twitter.com/rignova",
    youtube: "https://youtube.com/@rignova",
    discord: "https://discord.gg/rignova",
  },
} as const;

export const COLORS = {
  background: "#0B0F19",
  surface: "#111827",
  cyan: "#00E5FF",
  blue: "#5B8CFF",
  green: "#00FF88",
  white: "#FFFFFF",
} as const;
