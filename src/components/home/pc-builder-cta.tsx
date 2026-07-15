"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Cpu, Zap, Gauge, Share2, Save, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Cpu, label: "Compatibility Check" },
  { icon: Zap, label: "Power Calculator" },
  { icon: Gauge, label: "FPS Estimator" },
  { icon: Save, label: "Save Builds" },
  { icon: Share2, label: "Share Builds" },
];

export function PcBuilderCta() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="gradient-border glow-cyan overflow-hidden rounded-2xl"
        >
          <div className="relative bg-gradient-to-br from-surface via-surface to-surface-elevated p-8 md:p-12 lg:p-16">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-blue/5 blur-3xl" />

            <div className="relative grid items-center gap-8 lg:grid-cols-2">
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-cyan">
                  Custom PC Builder
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  Build Your Dream Rig
                </h2>
                <p className="mt-4 max-w-md text-muted">
                  Interactive configurator with live compatibility checks, bottleneck
                  detection, and real-time FPS estimates. No guesswork — just pure
                  performance.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {features.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    >
                      <Icon className="h-4 w-4 text-cyan" />
                      {label}
                    </div>
                  ))}
                </div>

                <Button size="lg" className="mt-8" asChild>
                  <Link href="/pc-builder">
                    Start Building
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="hidden lg:block">
                <div className="space-y-3">
                  {[
                    { name: "CPU", value: "AMD Ryzen 9 9950X", price: "₹58,999" },
                    { name: "GPU", value: "RTX 5080 Founders", price: "₹1,24,999" },
                    { name: "RAM", value: "32GB DDR5 6000MHz", price: "₹12,999" },
                    { name: "Storage", value: "2TB NVMe Gen5", price: "₹18,999" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between rounded-lg border border-white/8 bg-surface-elevated/50 px-4 py-3"
                    >
                      <div>
                        <p className="text-xs text-muted">{item.name}</p>
                        <p className="text-sm font-medium">{item.value}</p>
                      </div>
                      <p className="text-sm font-semibold text-cyan">{item.price}</p>
                    </motion.div>
                  ))}
                  <div className="flex items-center justify-between rounded-lg border border-cyan/20 bg-cyan/5 px-4 py-3">
                    <p className="font-display font-semibold">Estimated Total</p>
                    <p className="font-display text-lg font-bold text-cyan">₹2,15,996</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
