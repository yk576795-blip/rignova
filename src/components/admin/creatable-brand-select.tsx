"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Check, ChevronDown, Plus, Search, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
  slug?: string;
}

interface CreatableBrandSelectProps {
  brands: Brand[];
  value: string; // brandId
  onChange: (brandId: string) => void;
  onBrandCreated?: (brand: Brand) => void;
  error?: string;
  placeholder?: string;
}

export function CreatableBrandSelect({
  brands,
  value,
  onChange,
  onBrandCreated,
  error,
  placeholder = "Select or type brand name",
}: CreatableBrandSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedBrand = brands.find((b) => b.id === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter brands by query
  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase())
  );

  // Can create if query is non-empty and no exact match
  const canCreate =
    query.trim().length > 0 &&
    !brands.some((b) => b.name.toLowerCase() === query.trim().toLowerCase());

  const handleOpen = () => {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (brand: Brand) => {
    onChange(brand.id);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const handleCreate = useCallback(async () => {
    const name = query.trim();
    if (!name) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isActive: true }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create brand");
      }

      const brand: Brand = await res.json();
      toast.success(`Brand "${brand.name}" created`);
      onBrandCreated?.(brand);
      onChange(brand.id);
      setOpen(false);
      setQuery("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create brand");
    } finally {
      setCreating(false);
    }
  }, [query, onChange, onBrandCreated]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border bg-surface px-3 py-2 text-sm transition-colors text-left",
          open
            ? "border-cyan/30 ring-2 ring-cyan/20"
            : "border-white/10 hover:border-white/20",
          error && "border-destructive/50"
        )}
      >
        <span className={selectedBrand ? "text-foreground" : "text-muted"}>
          {selectedBrand ? selectedBrand.name : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selectedBrand && (
            <span
              onClick={handleClear}
              className="flex h-5 w-5 items-center justify-center rounded hover:bg-white/10 text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={cn("h-4 w-4 text-muted transition-transform", open && "rotate-180")}
          />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-xl border border-white/10 bg-surface shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2.5">
            <Search className="h-4 w-4 text-muted shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type new brand..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (canCreate) handleCreate();
                  else if (filtered.length === 1) handleSelect(filtered[0]);
                }
                if (e.key === "Escape") {
                  setOpen(false);
                  setQuery("");
                }
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && !canCreate && (
              <div className="px-4 py-6 text-center text-sm text-muted">
                No brands found
              </div>
            )}

            {filtered.map((brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => handleSelect(brand)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left",
                  value === brand.id && "text-cyan bg-cyan/5"
                )}
              >
                {/* Brand initial avatar */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-xs font-bold text-muted">
                  {brand.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="flex-1 truncate">{brand.name}</span>
                {value === brand.id && <Check className="h-4 w-4 text-cyan shrink-0" />}
              </button>
            ))}

            {/* Create new option */}
            {canCreate && (
              <>
                {filtered.length > 0 && (
                  <div className="mx-3 my-1 border-t border-white/8" />
                )}
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-cyan/5 text-cyan transition-colors"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0" />
                  )}
                  <span>
                    {creating
                      ? "Creating..."
                      : `Create brand "${query.trim()}"`}
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t border-white/8 px-4 py-2 bg-surface-elevated">
            <p className="text-xs text-muted">
              Type a name to search or create a new brand instantly
            </p>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
