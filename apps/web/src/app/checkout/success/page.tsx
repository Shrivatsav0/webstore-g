// apps/web/app/checkout/success/page.tsx
import { Suspense } from "react";
import { CheckoutSuccessContent } from "./CheckoutSuccessContent";
import { Loader2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
