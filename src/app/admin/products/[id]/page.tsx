"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Loader2, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { ImageUploader, type ImageEntry } from "@/components/admin/image-uploader";
import { CreatableBrandSelect } from "@/components/admin/creatable-brand-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Schema ──────────────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional().nullable(),
  sku: z.string().min(2, "SKU required"),
  price: z.string().min(1, "Price required"),
  compareAtPrice: z.string().optional().nullable(),
  costPrice: z.string().optional().nullable(),
  brandId: z.string().min(1, "Select a brand"),
  categoryId: z.string().min(1, "Select a category"),
  condition: z.enum(["NEW", "REFURBISHED", "USED_EXCELLENT", "USED_GOOD", "USED_FAIR"]),
  stock: z.string().min(1, "Stock required"),
  lowStockThreshold: z.string().optional(),
  warrantyMonths: z.string().optional(),
  weight: z.string().optional().nullable(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  hasRgb: z.boolean(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  // images managed separately via ImageUploader state
  specs: z.array(
    z.object({
      group: z.string().min(1, "Group required"),
      key: z.string().min(1, "Key required"),
      value: z.string().min(1, "Value required"),
    })
  ),
  benchmarks: z.array(
    z.object({
      game: z.string().min(1),
      resolution: z.string().min(1),
      fps: z.string().min(1),
      settings: z.string(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;
type BrandOption = { id: string; name: string };

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProductFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();

  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [categories, setCategories] = useState<{
    id: string;
    name: string;
    parentId: string | null;
    parent: { id: string; name: string } | null;
  }[]>([]);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [loadingData, setLoadingData] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "specs" | "benchmarks" | "seo">("basic");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      condition: "NEW",
      stock: "0",
      lowStockThreshold: "5",
      warrantyMonths: "12",
      isFeatured: false,
      isActive: true,
      hasRgb: false,
      specs: [],
      benchmarks: [],
    },
  });

  const specsField = useFieldArray({ control, name: "specs" });
  const benchmarksField = useFieldArray({ control, name: "benchmarks" });

  // Load brands + categories
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/brands").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]).then(([b, c]) => {
      setBrands(Array.isArray(b) ? b : []);
      setCategories(Array.isArray(c) ? c : []);
    });
  }, []);

  // Load existing product for edit
  useEffect(() => {
    if (isNew) return;
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((p) => {
        reset({
          name: p.name,
          description: p.description,
          shortDescription: p.shortDescription ?? "",
          sku: p.sku,
          price: String(p.price),
          compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : "",
          costPrice: p.costPrice != null ? String(p.costPrice) : "",
          brandId: p.brandId,
          categoryId: p.categoryId,
          condition: p.condition,
          stock: String(p.stock),
          lowStockThreshold: String(p.lowStockThreshold),
          warrantyMonths: String(p.warrantyMonths),
          weight: p.weight != null ? String(p.weight) : "",
          isFeatured: p.isFeatured,
          isActive: p.isActive,
          hasRgb: p.hasRgb,
          metaTitle: p.metaTitle ?? "",
          metaDescription: p.metaDescription ?? "",
          specs: p.specs.map((s: { group: string; key: string; value: string }) => s),
          benchmarks: p.benchmarks.map(
            (b: { game: string; resolution: string; fps: number; settings: string }) => ({
              ...b,
              fps: String(b.fps),
            })
          ),
        });
        setImages(
          p.images.map((img: { url: string; alt: string | null }) => ({
            url: img.url,
            alt: img.alt ?? "",
          }))
        );
      })
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setLoadingData(false));
  }, [id, isNew, reset]);

  const onSubmit = async (values: FormValues) => {
    if (images.length === 0) {
      toast.error("Add at least one product image");
      setActiveTab("basic");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...values,
        price: parseFloat(values.price),
        compareAtPrice: values.compareAtPrice ? parseFloat(values.compareAtPrice) : null,
        costPrice: values.costPrice ? parseFloat(values.costPrice) : null,
        stock: parseInt(values.stock, 10),
        lowStockThreshold: values.lowStockThreshold ? parseInt(values.lowStockThreshold, 10) : 5,
        warrantyMonths: values.warrantyMonths ? parseInt(values.warrantyMonths, 10) : 12,
        weight: values.weight ? parseFloat(values.weight) : null,
        benchmarks: values.benchmarks.map((b) => ({
          ...b,
          fps: parseInt(b.fps, 10),
          settings: b.settings || "Ultra",
        })),
        images: images.map((img, i) => ({
          url: img.url,
          alt: img.alt || values.name,
          isPrimary: i === 0,
          sortOrder: i,
        })),
      };

      const url = isNew ? "/api/admin/products" : `/api/admin/products/${id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Save failed");
      }

      toast.success(isNew ? "Product created!" : "Product updated!");
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-surface" />
        <div className="h-96 animate-pulse rounded-xl bg-surface" />
      </div>
    );
  }

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "specs", label: "Specifications" },
    { id: "benchmarks", label: "Benchmarks" },
    { id: "seo", label: "SEO" },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
      <PageHeader
        title={isNew ? "Add Product" : "Edit Product"}
        description={isNew ? "Fill in the details to add a new product." : "Update product information."}
        action={
          <div className="flex items-center gap-3">
            <Link href="/admin/products">
              <Button type="button" variant="secondary" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Button type="submit" size="sm" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/8">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.id
                ? "border-cyan text-cyan"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BASIC INFO ── */}
      {activeTab === "basic" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Product Details */}
            <Section title="Product Details">
              <Field label="Product Name" error={errors.name?.message} required>
                <Input {...register("name")} placeholder="e.g. NVIDIA RTX 4080 Super" />
              </Field>
              <Field label="Description" error={errors.description?.message} required>
                <textarea
                  {...register("description")}
                  rows={5}
                  className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
                  placeholder="Detailed product description..."
                />
              </Field>
              <Field label="Short Description" error={errors.shortDescription?.message}>
                <textarea
                  {...register("shortDescription")}
                  rows={2}
                  className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
                  placeholder="Brief summary (used in product cards)"
                />
              </Field>
            </Section>

            {/* Pricing */}
            <Section title="Pricing">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Selling Price (₹)" error={errors.price?.message} required>
                  <Input {...register("price")} type="number" step="0.01" placeholder="0.00" />
                </Field>
                <Field label="Compare At Price (₹)" error={errors.compareAtPrice?.message}>
                  <Input {...register("compareAtPrice")} type="number" step="0.01" placeholder="0.00" />
                </Field>
                <Field label="Cost Price (₹)" error={errors.costPrice?.message}>
                  <Input {...register("costPrice")} type="number" step="0.01" placeholder="0.00" />
                </Field>
              </div>
              <p className="text-xs text-muted">
                Compare At Price shows as strikethrough — used for discount display. Cost Price is internal only.
              </p>
            </Section>

            {/* Images */}
            <Section title="Product Images">
              <ImageUploader
                images={images}
                onChange={setImages}
                maxImages={8}
              />
            </Section>

          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Organization */}
            <Section title="Organization">
              <Field label="Brand" error={errors.brandId?.message} required>
                <Controller
                  name="brandId"
                  control={control}
                  render={({ field }) => (
                    <CreatableBrandSelect
                      brands={brands}
                      value={field.value ?? ""}
                      onChange={(brandId) => field.onChange(brandId)}
                      onBrandCreated={(newBrand) =>
                        setBrands((prev) => [...prev, newBrand])
                      }
                      error={errors.brandId?.message}
                    />
                  )}
                />
              </Field>

              <Field label="Category" error={errors.categoryId?.message} required>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => {
                    const parents = categories.filter((c) => !c.parentId);
                    const children = categories.filter((c) => !!c.parentId);

                    const grouped: { id: string; name: string; isChild: boolean }[] = [];
                    parents.forEach((p) => {
                      grouped.push({ id: p.id, name: p.name, isChild: false });
                      children
                        .filter((c) => c.parentId === p.id)
                        .forEach((c) =>
                          grouped.push({ id: c.id, name: c.name, isChild: true })
                        );
                    });
                    children
                      .filter((c) => !parents.find((p) => p.id === c.parentId))
                      .forEach((c) =>
                        grouped.push({ id: c.id, name: c.name, isChild: true })
                      );

                    const selected = grouped.find((c) => c.id === field.value);

                    return (
                      <CategorySelect
                        grouped={grouped}
                        value={field.value ?? ""}
                        selectedLabel={selected?.isChild ? `↳ ${selected.name}` : selected?.name}
                        onChange={field.onChange}
                        error={errors.categoryId?.message}
                      />
                    );
                  }}
                />
              </Field>

              <Field label="Condition" error={errors.condition?.message} required>
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? "NEW"} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="REFURBISHED">Refurbished</SelectItem>
                        <SelectItem value="USED_EXCELLENT">Used — Excellent</SelectItem>
                        <SelectItem value="USED_GOOD">Used — Good</SelectItem>
                        <SelectItem value="USED_FAIR">Used — Fair</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </Section>

            {/* Inventory */}
            <Section title="Inventory">
              <Field label="SKU" error={errors.sku?.message} required>
                <Input {...register("sku")} placeholder="e.g. GPU-RTX4080S-001" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Stock Qty" error={errors.stock?.message} required>
                  <Input {...register("stock")} type="number" min={0} />
                </Field>
                <Field label="Low Stock Alert">
                  <Input {...register("lowStockThreshold")} type="number" min={0} />
                </Field>
              </div>
            </Section>

            {/* Details */}
            <Section title="Details">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Warranty (months)">
                  <Input {...register("warrantyMonths")} type="number" min={0} />
                </Field>
                <Field label="Weight (kg)">
                  <Input {...register("weight")} type="number" step="0.01" placeholder="0.00" />
                </Field>
              </div>
            </Section>

            {/* Flags */}
            <Section title="Flags">
              <div className="space-y-2">
                <ToggleField label="Active" description="Visible to customers" name="isActive" register={register} />
                <ToggleField label="Featured" description="Show on homepage" name="isFeatured" register={register} />
                <ToggleField label="Has RGB" description="RGB lighting included" name="hasRgb" register={register} />
              </div>
            </Section>

          </div>
        </div>
      )}

      {/* ── SPECIFICATIONS ── */}
      {activeTab === "specs" && (
        <Section title="Technical Specifications">
          <p className="text-sm text-muted mb-4">
            Group specs by category (e.g. "GPU", "Memory", "Display").
          </p>
          <div className="space-y-3">
            {specsField.fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-3 gap-3 items-end">
                <Field label={i === 0 ? "Group" : ""} error={errors.specs?.[i]?.group?.message}>
                  <Input {...register(`specs.${i}.group`)} placeholder="e.g. GPU" />
                </Field>
                <Field label={i === 0 ? "Specification" : ""} error={errors.specs?.[i]?.key?.message}>
                  <Input {...register(`specs.${i}.key`)} placeholder="e.g. VRAM" />
                </Field>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label={i === 0 ? "Value" : ""} error={errors.specs?.[i]?.value?.message}>
                      <Input {...register(`specs.${i}.value`)} placeholder="e.g. 16 GB GDDR6X" />
                    </Field>
                  </div>
                  <button
                    type="button"
                    onClick={() => specsField.remove(i)}
                    className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => specsField.append({ group: "", key: "", value: "" })}
            >
              <Plus className="h-4 w-4" />
              Add Spec
            </Button>
          </div>
        </Section>
      )}

      {/* ── BENCHMARKS ── */}
      {activeTab === "benchmarks" && (
        <Section title="Gaming Benchmarks">
          <p className="text-sm text-muted mb-4">
            Add benchmark results to help customers understand performance.
          </p>
          <div className="space-y-3">
            {benchmarksField.fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-4 gap-3 items-end">
                <Field label={i === 0 ? "Game" : ""} error={errors.benchmarks?.[i]?.game?.message}>
                  <Input {...register(`benchmarks.${i}.game`)} placeholder="e.g. Cyberpunk 2077" />
                </Field>
                <Field label={i === 0 ? "Resolution" : ""} error={errors.benchmarks?.[i]?.resolution?.message}>
                  <Input {...register(`benchmarks.${i}.resolution`)} placeholder="e.g. 4K" />
                </Field>
                <Field label={i === 0 ? "FPS" : ""} error={errors.benchmarks?.[i]?.fps?.message}>
                  <Input {...register(`benchmarks.${i}.fps`)} type="number" placeholder="120" />
                </Field>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label={i === 0 ? "Settings" : ""}>
                      <Input {...register(`benchmarks.${i}.settings`)} placeholder="Ultra" />
                    </Field>
                  </div>
                  <button
                    type="button"
                    onClick={() => benchmarksField.remove(i)}
                    className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                benchmarksField.append({ game: "", resolution: "", fps: "0", settings: "Ultra" })
              }
            >
              <Plus className="h-4 w-4" />
              Add Benchmark
            </Button>
          </div>
        </Section>
      )}

      {/* ── SEO ── */}
      {activeTab === "seo" && (
        <Section title="SEO & Meta">
          <div className="max-w-2xl space-y-4">
            <Field label="Meta Title" error={errors.metaTitle?.message}>
              <Input {...register("metaTitle")} placeholder="Page title for search engines" />
            </Field>
            <Field label="Meta Description" error={errors.metaDescription?.message}>
              <textarea
                {...register("metaDescription")}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
                placeholder="Brief description for search result snippets (150–160 chars recommended)"
              />
            </Field>
            <div className="rounded-lg border border-white/8 bg-surface-elevated p-4">
              <p className="text-xs text-muted mb-2 font-medium uppercase tracking-wide">Google Preview</p>
              <p className="text-sm text-blue-400 truncate">
                {watch("metaTitle") || watch("name") || "Product Name"}
              </p>
              <p className="text-xs text-green-500">
                rignova.in/shop/{watch("name") ? watch("name").toLowerCase().replace(/\s+/g, "-") : "product-slug"}
              </p>
              <p className="text-xs text-muted mt-1 line-clamp-2">
                {watch("metaDescription") || watch("shortDescription") || watch("description") || "Product description will appear here."}
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/8 bg-surface/95 backdrop-blur-md px-6 py-3 flex items-center justify-between lg:left-60">
        <div className="flex gap-2 items-center">
          {Object.keys(errors).length > 0 && (
            <Badge variant="destructive">
              {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? "s" : ""}
            </Badge>
          )}
          {images.length === 0 && (
            <Badge variant="secondary">No images added</Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button type="button" variant="secondary" size="sm">Cancel</Button>
          </Link>
          <Button type="submit" size="sm" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-surface p-5 space-y-4">
      <h2 className="font-display text-sm font-semibold text-foreground border-b border-white/8 pb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label, error, required, children,
}: {
  label?: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-xs font-medium text-muted">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ToggleField({
  label, description, name, register,
}: {
  label: string; description: string;
  name: "isActive" | "isFeatured" | "hasRgb";
  register: ReturnType<typeof useForm<FormValues>>["register"];
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer rounded-lg border border-white/8 px-3 py-2.5 hover:bg-surface-elevated transition-colors">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <input type="checkbox" {...register(name)} className="h-4 w-4 accent-cyan cursor-pointer" />
    </label>
  );
}

// ─── Category Select (custom — avoids Radix undefined error) ─────────────────

function CategorySelect({
  grouped,
  value,
  selectedLabel,
  onChange,
  error,
}: {
  grouped: { id: string; name: string; isChild: boolean }[];
  value: string;
  selectedLabel?: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border bg-surface px-3 py-2 text-sm text-left transition-colors",
          open ? "border-cyan/30 ring-2 ring-cyan/20" : "border-white/10 hover:border-white/20",
          error && "border-destructive/50"
        )}
      >
        <span className={value ? "text-foreground" : "text-muted"}>
          {value ? (selectedLabel ?? "Selected") : "Select category"}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted transition-transform shrink-0", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-surface shadow-2xl">
          {grouped.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted">
              No categories yet — add them in the Categories page
            </div>
          ) : (
            <div className="py-1">
              {grouped.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange(c.id); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left",
                    c.isChild ? "pl-8 text-muted" : "font-medium",
                    value === c.id && "text-cyan bg-cyan/5"
                  )}
                >
                  {c.isChild && <span className="text-muted">↳</span>}
                  <span>{c.name}</span>
                  {value === c.id && <Check className="h-3.5 w-3.5 text-cyan ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
