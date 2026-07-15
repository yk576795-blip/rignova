"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2, GripVertical, Link2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ImageEntry {
  url: string;
  alt: string;
}

interface ImageUploaderProps {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
  maxImages?: number;
}

// Whether Cloudinary is configured
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const cloudinaryConfigured =
  CLOUD_NAME && CLOUD_NAME !== "your_cloud_name";

export function ImageUploader({
  images,
  onChange,
  maxImages = 8,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File, index?: number) => {
      const formData = new FormData();
      formData.append("file", file);

      const targetIndex = index ?? images.length;
      setUploading(targetIndex);

      try {
        if (cloudinaryConfigured) {
          // Direct unsigned browser upload — no API key/secret needed
          const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "rignova_products";
          const directForm = new FormData();
          directForm.append("file", file);
          directForm.append("upload_preset", preset);
          directForm.append("folder", "rignova/products");

          const directRes = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            { method: "POST", body: directForm }
          );

          if (directRes.ok) {
            const data = await directRes.json();
            const url = data.secure_url as string;
            const newImages = [...images];
            const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
            if (index !== undefined) {
              newImages[index] = { url, alt: images[index]?.alt || alt };
            } else {
              newImages.push({ url, alt });
            }
            onChange(newImages);
            toast.success("Image uploaded");
            return;
          }

          const errData = await directRes.json().catch(() => ({}));
          throw new Error(
            (errData as { error?: { message?: string } })?.error?.message ??
            "Upload failed. Check your Cloudinary upload preset is set to Unsigned."
          );
        } else {
          // Fallback: base64 preview (no cloud storage)
          const reader = new FileReader();
          reader.onload = (e) => {
            const url = e.target?.result as string;
            const newImages = [...images];
            const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
            if (index !== undefined) {
              newImages[index] = { url, alt: images[index]?.alt || alt };
            } else {
              newImages.push({ url, alt });
            }
            onChange(newImages);
            toast.success("Image added (configure Cloudinary for cloud storage)");
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(null);
      }
    },
    [images, onChange]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const remaining = maxImages - images.length;
      const toUpload = Array.from(files).slice(0, remaining);
      if (toUpload.length === 0) {
        toast.error(`Max ${maxImages} images allowed`);
        return;
      }
      // Upload sequentially to maintain order
      toUpload.reduce(
        (chain, file) => chain.then(() => uploadFile(file)),
        Promise.resolve()
      );
    },
    [images.length, maxImages, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const addUrlImage = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      toast.error("Enter a valid URL");
      return;
    }
    if (images.length >= maxImages) {
      toast.error(`Max ${maxImages} images`);
      return;
    }
    onChange([...images, { url: trimmed, alt: "" }]);
    setUrlInput("");
    setUrlMode(false);
  };

  const removeImage = (i: number) => {
    onChange(images.filter((_, idx) => idx !== i));
  };

  const updateAlt = (i: number, alt: string) => {
    const updated = [...images];
    updated[i] = { ...updated[i], alt };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className="group relative rounded-xl border border-white/8 bg-surface-elevated overflow-hidden"
            >
              {/* Primary badge */}
              {i === 0 && (
                <div className="absolute left-2 top-2 z-10 rounded-full bg-cyan px-2 py-0.5 text-[10px] font-bold text-background">
                  Primary
                </div>
              )}

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
              >
                <X className="h-3 w-3" />
              </button>

              {/* Replace on click */}
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, i);
                    e.target.value = "";
                  }}
                />
                <div className="relative aspect-square bg-surface-elevated">
                  {uploading === i ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated">
                      <Loader2 className="h-6 w-6 animate-spin text-cyan" />
                    </div>
                  ) : img.url ? (
                    <img
                      src={img.url}
                      alt={img.alt || "Product image"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%231a2234'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%2394a3b8' font-size='12'%3ENo image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs">Click to upload</span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  {img.url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-white font-medium">Replace</span>
                    </div>
                  )}
                </div>
              </label>

              {/* Alt text */}
              <div className="p-2">
                <input
                  type="text"
                  value={img.alt}
                  onChange={(e) => updateAlt(i, e.target.value)}
                  placeholder="Alt text..."
                  className="w-full rounded bg-transparent px-1 py-0.5 text-xs text-muted placeholder:text-muted/50 focus:outline-none focus:text-foreground border border-transparent focus:border-white/10"
                />
              </div>
            </div>
          ))}

          {/* Add more slot */}
          {images.length < maxImages && (
            <label className="cursor-pointer flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-cyan/30 hover:bg-cyan/5 transition-colors text-muted hover:text-cyan">
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {uploading !== null && uploading >= images.length ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">Add</span>
                </>
              )}
            </label>
          )}
        </div>
      )}

      {/* Drop zone (shown when no images) */}
      {images.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-xl border-2 border-dashed transition-all p-8",
            dragOver
              ? "border-cyan bg-cyan/5 scale-[1.01]"
              : "border-white/10 hover:border-cyan/30 hover:bg-cyan/5"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated">
              {uploading !== null ? (
                <Loader2 className="h-7 w-7 animate-spin text-cyan" />
              ) : (
                <Upload className="h-7 w-7 text-muted" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {dragOver ? "Drop to upload" : "Upload product images"}
              </p>
              <p className="mt-1 text-xs text-muted">
                Drag & drop or click to browse · JPEG, PNG, WebP · Max 10 MB each
              </p>
              {cloudinaryConfigured ? (
                <p className="mt-1 text-xs text-green">
                  ✓ Cloudinary connected — images stored in cloud
                </p>
              ) : (
                <p className="mt-1 text-xs text-amber-400">
                  ⚠ Cloudinary not configured — add env vars for cloud storage
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading !== null}
              >
                <Upload className="h-4 w-4" />
                Choose Files
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUrlMode((v) => !v)}
              >
                <Link2 className="h-4 w-4" />
                Use URL
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add more controls (shown when images exist) */}
      {images.length > 0 && images.length < maxImages && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading !== null}
          >
            <Upload className="h-4 w-4" />
            Upload More
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setUrlMode((v) => !v)}
          >
            <Link2 className="h-4 w-4" />
            Add URL
          </Button>
          <span className="text-xs text-muted ml-auto">
            {images.length}/{maxImages} images
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* URL input mode */}
      {urlMode && (
        <div className="flex items-end gap-2 rounded-xl border border-white/8 bg-surface-elevated p-4">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-muted">Image URL</Label>
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrlImage())}
              autoFocus
            />
          </div>
          <Button type="button" size="sm" onClick={addUrlImage}>
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { setUrlMode(false); setUrlInput(""); }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="text-xs text-muted">
        First image is the primary (shown in listings). Click any image to replace it.
      </p>
    </div>
  );
}
