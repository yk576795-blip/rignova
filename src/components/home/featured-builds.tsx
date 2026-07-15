"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Monitor } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { FEATURED_BUILDS } from "@/lib/constants/mock-data";

export function FeaturedBuilds() {
  return (
    <section className="py-20 bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="Pre-Built"
          title="Featured Builds"
          description="Hand-picked configurations optimized for every budget and resolution."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {FEATURED_BUILDS.map((build, index) => (
            <motion.article
              key={build.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group overflow-hidden rounded-xl border border-white/8 bg-surface transition-all hover:border-cyan/30"
            >
              <div className="relative aspect-video bg-gradient-to-br from-surface-elevated to-surface">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Monitor className="h-16 w-16 text-cyan/30" />
                </div>
                <Badge className="absolute left-4 top-4" variant="success">
                  {build.fps}
                </Badge>
              </div>

              <div className="p-6">
                <h3 className="font-display text-xl font-bold">{build.name}</h3>
                <p className="mt-1 text-sm text-muted">{build.resolution}</p>

                <ul className="mt-4 space-y-1.5">
                  {build.components.map((comp) => (
                    <li key={comp} className="flex items-center gap-2 text-sm text-muted">
                      <span className="h-1 w-1 rounded-full bg-cyan" />
                      {comp}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center justify-between">
                  <p className="font-display text-xl font-bold text-cyan">
                    {formatPrice(build.totalPrice)}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/pc-builder?build=${build.id}`}>
                      View Build
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
