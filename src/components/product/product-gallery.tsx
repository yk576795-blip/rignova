"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [show360, setShow360] = useState(false);

  const hasImages = images.length > 0;
  const activeImage = hasImages ? images[activeIndex] : null;

  const handleNext = () => setActiveIndex((i) => (i + 1) % images.length);
  const handlePrev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface-elevated aspect-square">
        {show360 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted">
            <RotateCcw className="h-16 w-16 animate-spin opacity-30" />
            <p className="text-sm font-medium">360° Viewer Coming Soon</p>
            <button
              onClick={() => setShow360(false)}
              className="text-xs text-cyan underline cursor-pointer"
            >
              Back to Photos
            </button>
          </div>
        ) : activeImage ? (
          <div
            className={cn(
              "relative h-full w-full cursor-zoom-in",
              isZoomed && "cursor-zoom-out overflow-hidden"
            )}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full"
              >
                {activeImage.url.startsWith("/") && !activeImage.url.includes("placeholder") ? (
                  <div
                    className="relative h-full w-full"
                    style={
                      isZoomed
                        ? {
                            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                            transform: "scale(2)",
                          }
                        : {}
                    }
                  >
                    <Image
                      src={activeImage.url}
                      alt={activeImage.alt || productName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan/20 to-blue/20">
                      <span className="font-display text-5xl font-bold text-cyan/40">RN</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan/20 to-blue/20">
              <span className="font-display text-5xl font-bold text-cyan/40">RN</span>
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-colors hover:bg-background cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-colors hover:bg-background cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-3 right-3 z-10 flex gap-2">
          <button
            onClick={() => setShow360(true)}
            className="flex items-center gap-1.5 rounded-lg bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-background cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            360°
          </button>
          <button
            className="flex items-center gap-1.5 rounded-lg bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-background cursor-pointer"
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <ZoomIn className="h-3.5 w-3.5" />
            Zoom
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border transition-all cursor-pointer",
                index === activeIndex
                  ? "border-cyan shadow-md shadow-cyan/20"
                  : "border-white/10 hover:border-white/30"
              )}
              aria-label={`Image ${index + 1}`}
            >
              {img.url && !img.url.includes("placeholder") ? (
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} view ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-elevated">
                  <span className="text-xs font-bold text-cyan/40">{index + 1}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
