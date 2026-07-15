"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RefreshCw, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Instant valuation in 60 seconds",
  "Free doorstep pickup",
  "Same-day payment on approval",
  "Upgrade to latest GPUs",
];

export function TradeInBanner() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-green/20 bg-gradient-to-r from-green/5 via-surface to-blue/5"
        >
          <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green/10">
                <RefreshCw className="h-6 w-6 text-green" />
              </div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Trade In Your Old GPU
              </h2>
              <p className="mt-4 text-muted">
                Get the best value for your used graphics card. Our transparent
                valuation process ensures fair pricing with instant quotes.
              </p>

              <ul className="mt-6 space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0 text-green" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Button size="lg" className="mt-8" asChild>
                <Link href="/sell-gpu">
                  Sell Your GPU
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative hidden md:block">
              <div className="rounded-xl border border-white/10 bg-surface-elevated p-6">
                <p className="text-sm text-muted">Estimated Trade-In Value</p>
                <p className="mt-2 font-display text-4xl font-bold text-green">
                  ₹42,500
                </p>
                <p className="mt-1 text-sm text-muted">for RTX 4070 Ti (Grade A)</p>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-green to-cyan" />
                </div>
                <p className="mt-2 text-xs text-muted">Market value: 75% of new price</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
