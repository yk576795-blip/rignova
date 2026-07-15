import { Suspense } from "react";
import { ShopContent } from "./shop-content";
import { Loader2 } from "lucide-react";

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
