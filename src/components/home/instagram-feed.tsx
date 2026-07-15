"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ExternalLink } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { INSTAGRAM_POSTS } from "@/lib/constants/mock-data";
import { BRAND } from "@/lib/constants/brand";

export function InstagramFeed() {
  return (
    <section className="py-20 bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="Community"
          title="Follow Our Builds"
          description="See the latest custom builds, unboxings, and gaming setups from our community."
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {INSTAGRAM_POSTS.map((post, index) => (
            <motion.a
              key={post.id}
              href={BRAND.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/8 bg-surface-elevated"
            >
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan/10 to-blue/10">
                <Heart className="h-8 w-8 text-white/20" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <ExternalLink className="h-6 w-6 text-white" />
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={BRAND.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-cyan hover:underline"
          >
            <Heart className="h-4 w-4" />
            @rignova on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
