"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2, Grid3X3 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable, type Column } from "@/components/admin/data-table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

const categorySchema = z.object({
  name: z.string().min(1, "Name required"),
  description: z.string().optional(),
  image: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.string().optional(),
  isActive: z.boolean(),
});
type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CategoryForm>({ resolver: zodResolver(categorySchema) });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: "", description: "", image: "", parentId: null, sortOrder: "0", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    reset({
      name: cat.name,
      description: cat.description ?? "",
      image: cat.image ?? "",
      parentId: cat.parentId ?? null,
      sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: CategoryForm) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        image: values.image || null,
        parentId: values.parentId || null,
        sortOrder: values.sortOrder ? parseInt(values.sortOrder, 10) : 0,
      };
      const url = editTarget
        ? `/api/admin/categories/${editTarget.id}`
        : "/api/admin/categories";
      const method = editTarget ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      toast.success(editTarget ? "Category updated" : "Category created");
      setDialogOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Parent options: exclude the category being edited to prevent self-reference
  const parentOptions = categories.filter((c) => c.id !== editTarget?.id && !c.parentId);

  const columns: Column<Category>[] = [
    {
      key: "name",
      label: "Category",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg overflow-hidden bg-surface-elevated flex items-center justify-center shrink-0">
            {row.image ? (
              <img src={row.image} alt={row.name} className="h-full w-full object-cover" />
            ) : (
              <Grid3X3 className="h-4 w-4 text-muted" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{row.name}</p>
            <p className="text-xs text-muted">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "parent",
      label: "Parent",
      render: (row) => (
        <span className="text-sm text-muted">{row.parent?.name ?? "—"}</span>
      ),
    },
    {
      key: "productCount",
      label: "Products",
      render: (row) => (
        <span className="text-sm font-medium">{row.productCount}</span>
      ),
    },
    {
      key: "sortOrder",
      label: "Order",
      render: (row) => (
        <span className="text-sm text-muted">{row.sortOrder}</span>
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
          <button
            onClick={() => openEdit(row)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-cyan transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
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
        title="Categories"
        description={`${categories.length} categories total`}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          placeholder="Search categories..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No categories yet. Add your first category."
      />

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input {...register("name")} placeholder="e.g. Graphics Cards" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted">Parent Category</Label>
              <Controller
                name="parentId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? "_none"}
                    onValueChange={(v) => field.onChange(v === "_none" ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (top-level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None (top-level)</SelectItem>
                      {parentOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted">Image URL</Label>
              <Input {...register("image")} placeholder="https://..." />
              {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted">Description</Label>
              <textarea
                {...register("description")}
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
                placeholder="Brief category description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted">Sort Order</Label>
                <Input {...register("sortOrder")} type="number" min={0} placeholder="0" />
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="h-4 w-4 accent-cyan"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>

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
                {saving ? "Saving..." : editTarget ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category"
        description={`Delete "${deleteTarget?.name}"? Products in this category will need to be reassigned.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
