"use client";

import { Star, ThumbsUp, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewUser {
  name: string;
  image: string | null;
}

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isVerified: boolean;
  createdAt: string;
  user: ReviewUser;
}

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

interface ProductReviewsProps {
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  ratingDistribution: RatingDistribution;
}

export function ProductReviews({
  reviews,
  avgRating,
  reviewCount,
  ratingDistribution,
}: ProductReviewsProps) {
  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="flex flex-col gap-6 rounded-2xl border border-white/8 bg-surface p-6 sm:flex-row">
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center gap-1 sm:w-40 sm:border-r sm:border-white/10">
          <span className="font-display text-6xl font-extrabold text-foreground">
            {avgRating > 0 ? avgRating.toFixed(1) : "–"}
          </span>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5",
                  i < Math.floor(avgRating) ? "fill-green text-green" : "text-white/20"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted">{reviewCount} reviews</span>
        </div>

        {/* Rating Breakdown */}
        <div className="flex flex-1 flex-col justify-center gap-2 sm:pl-6">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = ratingDistribution[star] ?? 0;
            const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2.5">
                <span className="w-4 text-right text-xs text-muted">{star}</span>
                <Star className="h-3.5 w-3.5 fill-green text-green" />
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green to-cyan transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-xs text-muted">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-surface p-8 text-center">
          <Star className="mx-auto h-10 w-10 text-white/20 mb-3" />
          <h4 className="font-display text-lg font-semibold text-foreground">No Reviews Yet</h4>
          <p className="mt-1 text-sm text-muted">Be the first to review this product.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const initials = review.user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={review.id}
                className="rounded-xl border border-white/8 bg-surface p-5 transition-colors hover:border-white/15"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan/30 to-blue/30 text-sm font-bold text-foreground">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{review.user.name}</span>
                      {review.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified Purchase
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="mt-1 flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            i < review.rating ? "fill-green text-green" : "text-white/20"
                          )}
                        />
                      ))}
                    </div>

                    {review.title && (
                      <p className="mt-2 font-semibold text-foreground">{review.title}</p>
                    )}
                    {review.comment && (
                      <p className="mt-1.5 text-sm text-muted leading-relaxed">{review.comment}</p>
                    )}

                    <button className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground cursor-pointer">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      Helpful
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
