"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-surface via-surface-elevated to-surface p-8 text-center md:p-16"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.08),transparent_70%)]" />

          <div className="relative">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Level Up Your Inbox
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted">
              Exclusive deals, early access to new GPUs, and expert build guides —
              delivered weekly.
            </p>

            {submitted ? (
              <div className="mt-8 flex items-center justify-center gap-2 text-green">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">You&apos;re subscribed! Welcome to the squad.</span>
              </div>
            ) : (
              <form
                className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <Input
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="flex-1"
                  aria-label="Email address"
                />
                <Button type="submit">
                  Subscribe
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
