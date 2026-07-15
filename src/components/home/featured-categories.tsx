"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
  gradient: string;
}

interface FeaturedCategoriesProps {
  categories: Category[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="Browse"
          title="Shop by Category"
          description="Find exactly what your rig needs — from flagship GPUs to premium peripherals."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/shop?category=${category.slug}`}
                className="group relative flex h-48 overflow-hidden rounded-xl border border-white/8 bg-surface transition-all hover:border-cyan/30 hover:shadow-lg hover:shadow-cyan/10"
              >
                {/* Background image if available */}
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                  />
                )}

                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-50 transition-opacity group-hover:opacity-80`}
                />

                <div className="relative flex h-full w-full flex-col justify-end p-6">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {category.productCount > 0
                      ? `${category.productCount} product${category.productCount !== 1 ? "s" : ""}`
                      : "Coming soon"}
                  </p>
                  <ArrowRight className="mt-3 h-5 w-5 text-cyan opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
