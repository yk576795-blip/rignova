import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan to-blue">
        <span className="font-display text-sm font-bold text-background">RN</span>
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan to-blue opacity-0 blur-md transition-opacity group-hover:opacity-60" />
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-bold tracking-tight text-foreground",
            sizes[size]
          )}
        >
          Rig<span className="text-gradient">Nova</span>
        </span>
        {size === "lg" && (
          <span className="text-xs text-muted">Build Beyond Limits</span>
        )}
      </div>
    </Link>
  );
}
