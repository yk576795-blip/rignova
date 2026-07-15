"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Truck,
  Wrench,
  RefreshCw,
  Headphones,
  LucideIcon,
} from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { WHY_CHOOSE_US } from "@/lib/constants/mock-data";

const iconMap: Record<string, LucideIcon> = {
  Shield,
  Zap,
  Truck,
  Wrench,
  RefreshCw,
  Headphones,
};

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="Why RigNova"
          title="Built for Gamers, by Gamers"
          description="We don't just sell hardware — we deliver complete gaming experiences with unmatched service."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE_US.map((item, index) => {
            const Icon = iconMap[item.icon] ?? Shield;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-xl border border-white/8 bg-surface p-6 transition-colors hover:border-cyan/20"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan/10">
                  <Icon className="h-6 w-6 text-cyan" />
                </div>
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
