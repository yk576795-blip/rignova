import { ArrowRight, BadgeCheck, PackageOpen, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellGPUPage() {
  const steps = [
    {
      title: "Share your GPU details",
      description: "Tell us the model, condition, and any accessories included.",
    },
    {
      title: "Get a competitive quote",
      description: "We evaluate market pricing and offer a fair trade-in or buyback value.",
    },
    {
      title: "Ship or drop off",
      description: "Choose pickup, courier, or a secure drop-off at our partner location.",
    },
  ];

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-surface via-surface to-surface-elevated p-8 sm:p-10">
        <Badge variant="outline" className="border-cyan/30 bg-cyan/10 text-cyan">
          <BadgeCheck className="mr-2 h-3.5 w-3.5" />
          Sell your GPU safely
        </Badge>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Turn your used GPU into instant value
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              From RTX 40-series to older flagship cards, we help you get the best resale value with transparent pricing and fast collection.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="cursor-pointer">
                <Link href="/contact">
                  Request a quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="cursor-pointer">
                <Link href="/used-gpus">Browse used GPUs</Link>
              </Button>
            </div>
          </div>

          <Card className="border-white/10 bg-surface/70">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Why sellers choose RigNova</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-surface-elevated/70 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan" />
                <div>
                  <p className="font-semibold text-foreground">Trusted evaluations</p>
                  <p className="mt-1 text-sm text-muted">We assess your card fairly based on condition, market demand, and age.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-surface-elevated/70 p-4">
                <PackageOpen className="mt-0.5 h-5 w-5 text-cyan" />
                <div>
                  <p className="font-semibold text-foreground">Fast pickup</p>
                  <p className="mt-1 text-sm text-muted">Secure collection and quick payment options for verified sellers.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step.title} className="border-white/10 bg-surface/70">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan/10 text-sm font-semibold text-cyan">
                0{index + 1}
              </div>
              <CardTitle className="mt-3 text-lg text-foreground">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-muted">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
