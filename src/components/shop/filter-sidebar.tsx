"use client";

import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Sparkles, Trash2 } from "lucide-react";

export interface FilterState {
  category: string;
  brand: string[];
  condition: string[];
  minPrice: number;
  maxPrice: number;
  hasRgb: boolean;
  inStock: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

interface DBItem {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export function FilterSidebar({ filters, onChange, onClear }: FilterSidebarProps) {
  // Fetch active categories
  const { data: categories } = useQuery<DBItem[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch active brands
  const { data: brands } = useQuery<DBItem[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await fetch("/api/brands");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const handlePriceChange = (value: number[]) => {
    onChange({
      ...filters,
      minPrice: value[0],
      maxPrice: value[1],
    });
  };

  const handleCategorySelect = (categorySlug: string) => {
    onChange({
      ...filters,
      category: filters.category === categorySlug ? "" : categorySlug,
    });
  };

  const handleBrandToggle = (brandSlug: string) => {
    const nextBrands = filters.brand.includes(brandSlug)
      ? filters.brand.filter((b) => b !== brandSlug)
      : [...filters.brand, brandSlug];
    onChange({
      ...filters,
      brand: nextBrands,
    });
  };

  const handleConditionToggle = (cond: string) => {
    const nextConds = filters.condition.includes(cond)
      ? filters.condition.filter((c) => c !== cond)
      : [...filters.condition, cond];
    onChange({
      ...filters,
      condition: nextConds,
    });
  };

  const handleToggleRgb = (checked: boolean) => {
    onChange({
      ...filters,
      hasRgb: checked,
    });
  };

  const handleToggleStock = (checked: boolean) => {
    onChange({
      ...filters,
      inStock: checked,
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 px-2 text-xs text-muted hover:text-cyan cursor-pointer"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Clear All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["price", "categories", "brands", "conditions", "specs"]} className="space-y-4">
        {/* Price Accordion */}
        <AccordionItem value="price" className="border-b border-white/8">
          <AccordionTrigger className="py-2 text-sm font-semibold hover:text-cyan">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-4">
            <div className="flex justify-between text-xs text-muted">
              <span>{formatPrice(filters.minPrice)}</span>
              <span>{formatPrice(filters.maxPrice)}</span>
            </div>
            <Slider
              min={0}
              max={300000}
              step={5000}
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={handlePriceChange}
              className="py-4"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Categories Accordion */}
        <AccordionItem value="categories" className="border-b border-white/8">
          <AccordionTrigger className="py-2 text-sm font-semibold hover:text-cyan">
            Categories
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="flex flex-col gap-1">
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors cursor-pointer ${
                    filters.category === cat.slug
                      ? "bg-cyan/15 text-cyan font-medium"
                      : "text-muted hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs opacity-60">({cat.productCount})</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brands Accordion */}
        <AccordionItem value="brands" className="border-b border-white/8">
          <AccordionTrigger className="py-2 text-sm font-semibold hover:text-cyan">
            Brands
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="space-y-2">
              {brands?.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.slug}`}
                    checked={filters.brand.includes(brand.slug)}
                    onCheckedChange={() => handleBrandToggle(brand.slug)}
                  />
                  <Label
                    htmlFor={`brand-${brand.slug}`}
                    className="text-sm text-muted cursor-pointer hover:text-foreground flex-1 flex justify-between"
                  >
                    <span>{brand.name}</span>
                    <span className="text-xs opacity-60">({brand.productCount})</span>
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Conditions Accordion */}
        <AccordionItem value="conditions" className="border-b border-white/8">
          <AccordionTrigger className="py-2 text-sm font-semibold hover:text-cyan">
            Condition
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="space-y-2">
              {[
                { label: "New", value: "NEW" },
                { label: "Refurbished", value: "REFURBISHED" },
                { label: "Used - Excellent", value: "USED_EXCELLENT" },
                { label: "Used - Good", value: "USED_GOOD" },
                { label: "Used - Fair", value: "USED_FAIR" },
              ].map((cond) => (
                <div key={cond.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cond-${cond.value}`}
                    checked={filters.condition.includes(cond.value)}
                    onCheckedChange={() => handleConditionToggle(cond.value)}
                  />
                  <Label
                    htmlFor={`cond-${cond.value}`}
                    className="text-sm text-muted cursor-pointer hover:text-foreground flex-1"
                  >
                    {cond.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Specs Accordion */}
        <AccordionItem value="specs" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-semibold hover:text-cyan">
            Specifications
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-rgb"
                checked={filters.hasRgb}
                onCheckedChange={handleToggleRgb}
              />
              <Label
                htmlFor="filter-rgb"
                className="text-sm text-muted cursor-pointer hover:text-foreground flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan" />
                RGB Lightning
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-stock"
                checked={filters.inStock}
                onCheckedChange={handleToggleStock}
              />
              <Label
                htmlFor="filter-stock"
                className="text-sm text-muted cursor-pointer hover:text-foreground"
              >
                In Stock Only
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
