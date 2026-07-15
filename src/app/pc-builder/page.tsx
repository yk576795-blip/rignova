import { Cpu, HardDrive, Monitor, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PCBuilderPage() {
  const components = [
    {
      title: "CPU & motherboard",
      description: "Start with the processor and platform that match your target performance budget.",
      icon: Cpu,
    },
    {
      title: "Memory & storage",
      description: "Balance fast RAM and SSD capacity for responsive gameplay and multitasking.",
      icon: HardDrive,
    },
    {
      title: "Display & peripherals",
      description: "Pair your build with a display and gear that make the experience feel complete.",
      icon: Monitor,
    },
  ];

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-surface via-surface to-surface-elevated p-8 sm:p-10">
        <Badge variant="outline" className="border-cyan/30 bg-cyan/10 text-cyan">
          <Sparkles className="mr-2 h-3.5 w-3.5" />
          Build your ideal rig
        </Badge>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              PC Builder
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              Create a custom gaming desktop for esports, streaming, content creation, and everyday performance. Our curated catalog helps you pick components that fit together smoothly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="cursor-pointer">
                <Link href="/shop">Start building</Link>
              </Button>
              <Button variant="outline" asChild className="cursor-pointer">
                <Link href="/accessories">Explore peripherals</Link>
              </Button>
            </div>
          </div>

          <Card className="border-white/10 bg-surface/70">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Suggested build flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {components.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-surface-elevated/70 p-4">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-muted">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
