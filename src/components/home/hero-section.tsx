"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="hero-gradient grid-pattern relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan/5 blur-3xl animate-pulse-glow" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-blue/5 blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="default" className="mb-6">
              <Zap className="mr-1 h-3 w-3" />
              New RTX 50 Series In Stock
            </Badge>

            <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Build Beyond
              <br />
              <span className="text-gradient">Limits</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Premium gaming hardware, custom-built PCs, and certified used GPUs.
              Engineered for champions, delivered across India.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/shop">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pc-builder">
                  <Cpu className="h-4 w-4" />
                  PC Builder
                </Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap gap-8">
              {[
                { value: "50K+", label: "Happy Gamers" },
                { value: "10K+", label: "Custom Builds" },
                { value: "4.9★", label: "Average Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="gradient-border glow-cyan relative aspect-square max-w-lg mx-auto overflow-hidden rounded-2xl">
              <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-surface to-surface-elevated p-8">
                <div className="relative">
                  <div className="h-48 w-48 rounded-2xl bg-gradient-to-br from-cyan/30 via-blue/20 to-green/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="h-20 w-20 text-cyan" />
                  </div>
                  <div className="absolute -right-4 -top-4 rounded-lg glass px-3 py-1.5 text-xs font-medium text-cyan">
                    RTX 5080
                  </div>
                  <div className="absolute -bottom-4 -left-4 rounded-lg glass px-3 py-1.5 text-xs font-medium text-green">
                    240+ FPS
                  </div>
                </div>
                <p className="mt-8 text-center font-display text-xl font-semibold">
                  NovaStrike Gaming PC
                </p>
                <p className="mt-1 text-sm text-muted">Starting at ₹1,89,999</p>
              </div>
            </div>

            <div className="absolute -right-4 top-1/4 glass rounded-xl p-4 glow-blue">
              <Shield className="h-6 w-6 text-cyan" />
              <p className="mt-1 text-xs font-medium">3 Year Warranty</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
