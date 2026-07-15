"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2, Globe, Tag } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

const brandSchema = z.object({
  name: z.string().min(1, "Name required"),
  logo: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  isActive: z.boolean(),
});
type BrandForm = z.infer<typeof brandSchema>;

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandForm>({ resolver: zodResolver(brandSchema) });

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/brands?${params}`);
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: "", logo: "", description: "", website: "", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditTarget(brand);
    reset({
      name: brand.name,
      logo: brand.logo ?? "",
      description: brand.description ?? "",
      website: brand.website ?? "",
      isActive: brand.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: BrandForm) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        logo: values.logo || null,
        website: values.website || null,
      };
      const url = editTarget ? `/api/admin/brands/${editTarget.id}` : "/api/admin/brands";
      const method = editTarget ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      toast.success(editTarget ? "Brand updated" : "Brand created");
      setDialogOpen(false);
      fetchBrands();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save brand");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/brands/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchBrands();
    } catch {
      toast.error("Failed to delete brand");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        description={`${brands.length} brands total`}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          placeholder="Search brands..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-surface py-16 text-center text-muted">
          <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No brands yet. Add your first brand.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((brand) => (
            <div
              key={brand.id}
              className="rounded-xl border border-white/8 bg-surface p-4 flex flex-col gap-3 hover:border-white/15 transition-colors"
            >
              {/* Logo / Initial */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-surface-elevated flex items-center justify-center overflow-hidden shrink-0">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <span className="font-display text-lg font-bold text-muted">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{brand.name}</p>
                  <p className="text-xs text-muted">{brand.productCount} products</p>
                </div>
              </div>

              {brand.description && (
                <p className="text-xs text-muted line-clamp-2">{brand.description}</p>
              )}

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <Badge variant={brand.isActive ? "success" : "secondary"}>
                    {brand.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-cyan transition-colors"
                      title="Website"
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(brand)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-cyan transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(brand)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Brand" : "Add Brand"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted">
                Brand Name <span className="text-destructive">*</span>
              </Label>
              <Input {...register("name")} placeholder="e.g. NVIDIA" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted">Logo URL</Label>
              <Input {...register("logo")} placeholder="https://..." />
              {errors.logo && <p className="text-xs text-destructive">{errors.logo.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted">Website</Label>
              <Input {...register("website")} placeholder="https://nvidia.com" />
              {errors.website && (
                <p className="text-xs text-destructive">{errors.website.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted">Description</Label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
                placeholder="Brief brand description..."
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("isActive")} className="h-4 w-4 accent-cyan" />
              <span className="text-sm">Active (visible in filters)</span>
            </label>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : editTarget ? "Save Changes" : "Create Brand"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Brand"
        description={`Delete "${deleteTarget?.name}"? Products using this brand may be affected.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
