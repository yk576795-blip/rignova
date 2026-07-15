"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FilterSidebar, FilterState } from "@/components/shop/filter-sidebar";
import { ProductGrid } from "@/components/shop/product-grid";
import { QuickViewModal } from "@/components/shop/quick-view-modal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import type { ProductCardData } from "@/lib/constants/mock-data";

const DEFAULT_FILTERS: FilterState = {
  category: "",
  brand: [],
  condition: [],
  minPrice: 0,
  maxPrice: 300000,
  hasRgb: false,
  inStock: false,
};

export function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "newest";
  const initialMinPrice = searchParams.get("minPrice")
    ? parseInt(searchParams.get("minPrice")!)
    : 0;
  const initialMaxPrice = searchParams.get("maxPrice")
    ? parseInt(searchParams.get("maxPrice")!)
    : 300000;
  const initialHasRgb = searchParams.get("hasRgb") === "true";
  const initialInStock = searchParams.get("inStock") === "true";
  const initialBrand = searchParams.get("brand")?.split(",").filter(Boolean) || [];
  const initialCondition =
    searchParams.get("condition")?.split(",").filter(Boolean) || [];

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    brand: initialBrand,
    condition: initialCondition,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    hasRgb: initialHasRgb,
    inStock: initialInStock,
  });

  const [searchVal, setSearchVal] = useState(initialSearch);
  const [sortVal, setSortVal] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardData | null>(null);

  useEffect(() => {
    setFilters({
      category: searchParams.get("category") || "",
      brand: searchParams.get("brand")?.split(",").filter(Boolean) || [],
      condition: searchParams.get("condition")?.split(",").filter(Boolean) || [],
      minPrice: searchParams.get("minPrice")
        ? parseInt(searchParams.get("minPrice")!)
        : 0,
      maxPrice: searchParams.get("maxPrice")
        ? parseInt(searchParams.get("maxPrice")!)
        : 300000,
      hasRgb: searchParams.get("hasRgb") === "true",
      inStock: searchParams.get("inStock") === "true",
    });
    setSearchVal(searchParams.get("search") || "");
    setSortVal(searchParams.get("sort") || "newest");
    setPage(1);
  }, [searchParams]);

  const updateUrl = (
    nextFilters: FilterState,
    nextSearch: string,
    nextSort: string
  ) => {
    const params = new URLSearchParams();
    if (nextFilters.category) params.set("category", nextFilters.category);
    if (nextFilters.brand.length > 0)
      params.set("brand", nextFilters.brand.join(","));
    if (nextFilters.condition.length > 0)
      params.set("condition", nextFilters.condition.join(","));
    if (nextFilters.minPrice > 0)
      params.set("minPrice", nextFilters.minPrice.toString());
    if (nextFilters.maxPrice < 300000)
      params.set("maxPrice", nextFilters.maxPrice.toString());
    if (nextFilters.hasRgb) params.set("hasRgb", "true");
    if (nextFilters.inStock) params.set("inStock", "true");
    if (nextSearch) params.set("search", nextSearch);
    if (nextSort !== "newest") params.set("sort", nextSort);

    startTransition(() => {
      router.push(`/shop?${params.toString()}`, { scroll: false });
    });
  };

  const queryParams = new URLSearchParams();
  if (filters.category) queryParams.set("category", filters.category);
  if (filters.brand.length > 0) queryParams.set("brand", filters.brand.join(","));
  if (filters.condition.length > 0)
    queryParams.set("condition", filters.condition.join(","));
  if (filters.minPrice > 0)
    queryParams.set("minPrice", filters.minPrice.toString());
  if (filters.maxPrice < 300000)
    queryParams.set("maxPrice", filters.maxPrice.toString());
  if (filters.hasRgb) queryParams.set("hasRgb", "true");
  if (filters.inStock) queryParams.set("inStock", "true");
  if (searchVal) queryParams.set("search", searchVal);
  queryParams.set("sort", sortVal);
  queryParams.set("page", page.toString());
  queryParams.set("limit", "12");

  const { data, isLoading } = useQuery<{
    products: ProductCardData[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }>({
    queryKey: ["products", queryParams.toString()],
    queryFn: () =>
      fetch(`/api/products?${queryParams.toString()}`).then((r) => r.json()),
  });

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    updateUrl(newFilters, searchVal, sortVal);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(filters, searchVal, sortVal);
  };

  const handleSortChange = (val: string) => {
    setSortVal(val);
    updateUrl(filters, searchVal, val);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchVal("");
    updateUrl(DEFAULT_FILTERS, "", sortVal);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/8 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">
            RigNova Shop
          </h1>
          <p className="mt-1 text-sm text-muted">
            Power up your setup with our performance-verified hardware catalog.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 min-w-[240px] md:max-w-xs"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search components..."
              className="pl-10"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </form>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                className="md:hidden cursor-pointer"
                size="icon"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-surface text-foreground border-white/10 w-[280px]"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Filter Products</SheetTitle>
              </SheetHeader>
              <div className="py-4 h-full overflow-y-auto">
                <FilterSidebar
                  filters={filters}
                  onChange={handleFilterChange}
                  onClear={handleClearFilters}
                />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted hidden sm:inline" />
            <Select value={sortVal} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[160px] cursor-pointer">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest Arrivals</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="best-selling">Best Sellers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-8">
        <aside className="hidden w-64 shrink-0 md:block">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </aside>

        <div className="flex-1 space-y-8">
          <ProductGrid
            products={data?.products || []}
            isLoading={isLoading}
            onQuickView={(p) => setQuickViewProduct(p)}
          />

          {data && data.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-white/8 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="cursor-pointer"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <span>Page</span>
                <span className="font-semibold text-foreground">{page}</span>
                <span>of</span>
                <span className="font-semibold text-foreground">
                  {data.pagination.pages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(data.pagination.pages, p + 1))
                }
                disabled={page === data.pagination.pages}
                className="cursor-pointer"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}
