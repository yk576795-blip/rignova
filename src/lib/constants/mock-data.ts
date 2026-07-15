export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  brand: string;
  category: string;
  condition?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
}

export const FEATURED_CATEGORIES = [
  {
    id: "gaming-pcs",
    name: "Gaming PCs",
    slug: "gaming-pcs",
    image: "/images/categories/gaming-pcs.jpg",
    productCount: 48,
    gradient: "from-cyan-500/20 to-blue-600/20",
  },
  {
    id: "gpus",
    name: "Graphics Cards",
    slug: "gpus",
    image: "/images/categories/gpus.jpg",
    productCount: 124,
    gradient: "from-green-500/20 to-cyan-500/20",
  },
  {
    id: "cpus",
    name: "Processors",
    slug: "cpus",
    image: "/images/categories/cpus.jpg",
    productCount: 67,
    gradient: "from-blue-500/20 to-purple-600/20",
  },
  {
    id: "motherboards",
    name: "Motherboards",
    slug: "motherboards",
    image: "/images/categories/motherboards.jpg",
    productCount: 89,
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "ram",
    name: "Memory",
    slug: "ram",
    image: "/images/categories/ram.jpg",
    productCount: 56,
    gradient: "from-pink-500/20 to-rose-500/20",
  },
  {
    id: "storage",
    name: "Storage",
    slug: "storage",
    image: "/images/categories/storage.jpg",
    productCount: 78,
    gradient: "from-violet-500/20 to-indigo-500/20",
  },
] as const;

export const MOCK_PRODUCTS: ProductCardData[] = [
  {
    id: "1",
    name: "NovaStrike RTX 5080 Gaming PC",
    slug: "novastrike-rtx-5080",
    price: 189999,
    compareAtPrice: 219999,
    image: "/images/products/gaming-pc-1.jpg",
    brand: "RigNova",
    category: "Gaming PCs",
    rating: 4.9,
    reviewCount: 128,
    badge: "Best Seller",
    inStock: true,
  },
  {
    id: "2",
    name: "NVIDIA GeForce RTX 5080 Founders Edition",
    slug: "rtx-5080-fe",
    price: 124999,
    compareAtPrice: 139999,
    image: "/images/products/gpu-1.jpg",
    brand: "NVIDIA",
    category: "GPUs",
    rating: 4.8,
    reviewCount: 256,
    badge: "New Arrival",
    inStock: true,
  },
  {
    id: "3",
    name: "AMD Ryzen 9 9950X Processor",
    slug: "ryzen-9-9950x",
    price: 58999,
    image: "/images/products/cpu-1.jpg",
    brand: "AMD",
    category: "CPUs",
    rating: 4.7,
    reviewCount: 89,
    inStock: true,
  },
  {
    id: "4",
    name: "Corsair Vengeance RGB 32GB DDR5",
    slug: "corsair-vengeance-32gb",
    price: 12999,
    compareAtPrice: 14999,
    image: "/images/products/ram-1.jpg",
    brand: "Corsair",
    category: "RAM",
    rating: 4.6,
    reviewCount: 312,
    inStock: true,
  },
  {
    id: "5",
    name: "Samsung 990 Pro 2TB NVMe SSD",
    slug: "samsung-990-pro-2tb",
    price: 18999,
    image: "/images/products/ssd-1.jpg",
    brand: "Samsung",
    category: "Storage",
    rating: 4.9,
    reviewCount: 445,
    badge: "Top Rated",
    inStock: true,
  },
  {
    id: "6",
    name: "ASUS ROG Strix Z890-E Motherboard",
    slug: "rog-strix-z890",
    price: 42999,
    image: "/images/products/mobo-1.jpg",
    brand: "ASUS",
    category: "Motherboards",
    rating: 4.5,
    reviewCount: 67,
    inStock: true,
  },
  {
    id: "7",
    name: "RTX 4070 Ti Super (Used - Grade A)",
    slug: "rtx-4070ti-used",
    price: 54999,
    compareAtPrice: 79999,
    image: "/images/products/used-gpu-1.jpg",
    brand: "NVIDIA",
    category: "Used GPUs",
    condition: "Grade A",
    rating: 4.4,
    reviewCount: 34,
    badge: "Hot Deal",
    inStock: true,
  },
  {
    id: "8",
    name: "PlayStation 5 Pro Console",
    slug: "ps5-pro",
    price: 64999,
    image: "/images/products/ps5.jpg",
    brand: "Sony",
    category: "Consoles",
    rating: 4.8,
    reviewCount: 198,
    inStock: true,
  },
];

export const FEATURED_BUILDS = [
  {
    id: "build-1",
    name: "Shadow Reaper",
    totalPrice: 145999,
    fps: "240+ FPS",
    resolution: "1440p Ultra",
    components: ["RTX 5070", "Ryzen 7 9800X", "32GB DDR5", "1TB NVMe"],
    image: "/images/builds/shadow-reaper.jpg",
  },
  {
    id: "build-2",
    name: "Quantum Forge",
    totalPrice: 289999,
    fps: "165+ FPS",
    resolution: "4K Ultra",
    components: ["RTX 5090", "Ryzen 9 9950X", "64GB DDR5", "2TB NVMe"],
    image: "/images/builds/quantum-forge.jpg",
  },
  {
    id: "build-3",
    name: "Budget Beast",
    totalPrice: 79999,
    fps: "120+ FPS",
    resolution: "1080p High",
    components: ["RTX 4060", "Ryzen 5 7600", "16GB DDR5", "512GB NVMe"],
    image: "/images/builds/budget-beast.jpg",
  },
] as const;

export const BRAND_LOGOS = [
  { name: "NVIDIA", logo: "/images/brands/nvidia.svg" },
  { name: "AMD", logo: "/images/brands/amd.svg" },
  { name: "Intel", logo: "/images/brands/intel.svg" },
  { name: "ASUS", logo: "/images/brands/asus.svg" },
  { name: "MSI", logo: "/images/brands/msi.svg" },
  { name: "Corsair", logo: "/images/brands/corsair.svg" },
  { name: "Samsung", logo: "/images/brands/samsung.svg" },
  { name: "Logitech", logo: "/images/brands/logitech.svg" },
] as const;

export const TESTIMONIALS = [
  {
    id: "1",
    name: "Arjun Mehta",
    role: "Pro Gamer & Streamer",
    avatar: "/images/avatars/arjun.jpg",
    rating: 5,
    text: "RigNova built my dream streaming rig. The PC builder tool made it effortless, and delivery was lightning fast. Absolutely top-tier quality.",
  },
  {
    id: "2",
    name: "Priya Sharma",
    role: "Content Creator",
    avatar: "/images/avatars/priya.jpg",
    rating: 5,
    text: "Sold my old RTX 3080 through their trade-in program and got a fair price instantly. The whole process was transparent and hassle-free.",
  },
  {
    id: "3",
    name: "Rahul Verma",
    role: "Esports Player",
    avatar: "/images/avatars/rahul.jpg",
    rating: 5,
    text: "The used GPU section is a game-changer. Got a Grade A RTX 4070 Ti with full warranty. Stress-tested and benchmarked — exactly as promised.",
  },
] as const;

export const WHY_CHOOSE_US = [
  {
    icon: "Shield",
    title: "Genuine Warranty",
    description:
      "Every product backed by manufacturer warranty with hassle-free claim support.",
  },
  {
    icon: "Zap",
    title: "Stress Tested GPUs",
    description:
      "Used graphics cards undergo 72-hour stress testing before listing.",
  },
  {
    icon: "Truck",
    title: "Pan-India Delivery",
    description:
      "Secure packaging and insured shipping to 19,000+ pin codes across India.",
  },
  {
    icon: "Wrench",
    title: "Expert Assembly",
    description:
      "Certified technicians assemble and cable-manage every custom build.",
  },
  {
    icon: "RefreshCw",
    title: "Easy Trade-In",
    description:
      "Upgrade your GPU with our transparent trade-in valuation program.",
  },
  {
    icon: "Headphones",
    title: "24/7 Support",
    description:
      "Dedicated gaming hardware experts available round the clock for assistance.",
  },
] as const;

export const HOME_FAQS = [
  {
    question: "How does the custom PC builder work?",
    answer:
      "Our interactive PC builder lets you select compatible components with real-time compatibility checks, power consumption estimates, and FPS predictions. Save, share, or order your build directly.",
  },
  {
    question: "Are used GPUs reliable?",
    answer:
      "Every used GPU goes through rigorous 72-hour stress testing, benchmark verification, and serial number validation. Each card is graded (A, B, C) with detailed condition reports.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit/debit cards, UPI, net banking via Razorpay, and Cash on Delivery for select pin codes.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Metro cities: 2-3 business days. Tier 2/3 cities: 4-7 business days. Custom builds may take 3-5 additional days for assembly and testing.",
  },
] as const;

export const INSTAGRAM_POSTS = [
  { id: "1", image: "/images/instagram/post-1.jpg", likes: 1240 },
  { id: "2", image: "/images/instagram/post-2.jpg", likes: 890 },
  { id: "3", image: "/images/instagram/post-3.jpg", likes: 2100 },
  { id: "4", image: "/images/instagram/post-4.jpg", likes: 1560 },
  { id: "5", image: "/images/instagram/post-5.jpg", likes: 980 },
  { id: "6", image: "/images/instagram/post-6.jpg", likes: 1750 },
] as const;
