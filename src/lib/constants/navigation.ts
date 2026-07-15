export const MAIN_NAV = [
  { label: "Shop", href: "/shop" },
  { label: "PC Builder", href: "/pc-builder" },
  { label: "Used GPUs", href: "/used-gpus" },
  { label: "Consoles", href: "/consoles" },
  { label: "Accessories", href: "/accessories" },
  { label: "Sell GPU", href: "/sell-gpu" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { label: "Gaming PCs", href: "/shop?category=gaming-pcs" },
    { label: "Graphics Cards", href: "/shop?category=gpus" },
    { label: "Processors", href: "/shop?category=cpus" },
    { label: "Motherboards", href: "/shop?category=motherboards" },
    { label: "Used GPUs", href: "/used-gpus" },
    { label: "Accessories", href: "/accessories" },
  ],
  support: [
    { label: "Warranty Claim", href: "/warranty" },
    { label: "Track Order", href: "/track-order" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Support", href: "/support" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;
