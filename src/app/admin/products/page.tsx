"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Package, Filter } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  brand: { id: string; name: string };
  category: { id: string; name: string };
  condition: string;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  hasRgb: boolean;
  image: string | null;
  reviewCount: number;
  orderCount: number;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  REFURBISHED: "Refurb",
  USED_EXCELLENT: "Used (Exc)",
  USED_GOOD: "Used (Good)",
  USED_FAIR: "Used (Fair)",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Load filter options once
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/brands").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]).then(([b, c]) => {
      setBrands(Array.isArray(b) ? b : []);
      setCategories(Array.isArray(c) ? c : []);
    });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(categoryFilter && { categoryId: categoryFilter }),
        ...(brandFilter && { brandId: brandFilter }),
      });
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setPagination(data.pagination ?? { total: 0, page: 1, limit: 20, pages: 0 });
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, brandFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: "name",
      label: "Product",
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-surface-elevated flex items-center justify-center">
            {row.image ? (
              <img src={row.image} alt={row.name} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-5 w-5 text-muted" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate max-w-[200px]">{row.name}</p>
            <p className="text-xs text-muted">{row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "brand",
      label: "Brand",
      render: (row) => (
        <span className="text-sm text-muted">{row.brand.name}</span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="text-sm text-muted">{row.category.name}</span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (row) => (
        <div>
          <p className="text-sm font-semibold">{formatPrice(row.price)}</p>
          {row.compareAtPrice && (
            <p className="text-xs text-muted line-through">{formatPrice(row.compareAtPrice)}</p>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (row) => (
        <Badge
          variant={row.stock === 0 ? "destructive" : row.stock <= 5 ? "secondary" : "success"}
        >
          {row.stock === 0 ? "Out of Stock" : `${row.stock} units`}
        </Badge>
      ),
    },
    {
      key: "condition",
      label: "Condition",
      render: (row) => (
        <Badge variant="outline">{CONDITION_LABELS[row.condition] ?? row.condition}</Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/products/${row.id}`}>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-cyan transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </Link>
          <button
            onClick={() => setDeleteTarget(row)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={`${pagination.total} products total`}
        action={
          <Link href="/admin/products/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              placeholder="Search by name or SKU..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="shrink-0">
            <Filter className="h-4 w-4" />
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          <Select
            value={brandFilter}
            onValueChange={(v) => {
              setBrandFilter(v === "_all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36 h-11">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v === "_all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 h-11">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No products found. Add your first product to get started."
        pagination={{
          page: pagination.page,
          pages: pagination.pages,
          total: pagination.total,
          onPageChange: setPage,
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
