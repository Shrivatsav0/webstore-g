// apps/web/app/checkout/success/checkout-success-content.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";

type OrderItem = {
  id: string | number;
  productName: string;
  quantity: number;
  total: number; // in cents
};

type Order = {
  id: number;
  status: string;
  total: number; // in cents
  customerEmail?: string | null;
  items?: OrderItem[];
  receiptUrl?: string | null;
};

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL params
  const urlOrderParam = searchParams.get("order");
  const urlSessionParam = searchParams.get("session");

  // Local state for fallbacks (sessionStorage)
  const [fallbackOrderId, setFallbackOrderId] = useState<number | null>(null);
  const [fallbackSessionId, setFallbackSessionId] = useState<string | null>(
    null
  );

  // Parse orderId from URL if present
  const orderIdFromUrl = useMemo(() => {
    if (!urlOrderParam) return null;
    const num = parseInt(urlOrderParam, 10);
    return Number.isFinite(num) ? num : null;
  }, [urlOrderParam]);

  // Take sessionId from URL if present
  const sessionIdFromUrl = urlSessionParam || null;

  // Load fallbacks from sessionStorage once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only check storage if neither is in the URL
    if (!orderIdFromUrl && !sessionIdFromUrl) {
      try {
        const storedOrderId = window.sessionStorage.getItem("pending_order_id");
        const storedSessionId =
          window.sessionStorage.getItem("cart_session_id");
        if (storedOrderId) {
          const parsed = parseInt(storedOrderId, 10);
          if (Number.isFinite(parsed)) {
            setFallbackOrderId(parsed);
          }
        }
        if (storedSessionId) {
          setFallbackSessionId(storedSessionId);
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [orderIdFromUrl, sessionIdFromUrl]);

  // Effective identifiers following the priority:
  // 1) orderId from URL
  // 2) orderId from sessionStorage
  // 3) sessionId from URL
  // 4) sessionId from sessionStorage
  const effectiveOrderId = orderIdFromUrl ?? fallbackOrderId;
  const effectiveSessionId = sessionIdFromUrl ?? fallbackSessionId;

  // Primary query: by orderId
  const orderByIdQuery = useQuery<Order>({
    ...orpc.checkout.getOrder.queryOptions({
      input: { orderId: effectiveOrderId! },
    }),
    enabled: Boolean(effectiveOrderId),
    retry: false,
  });

  // Secondary query: by sessionId
  const orderBySessionQuery = useQuery<Order>({
    ...orpc.checkout.getOrderBySession.queryOptions({
      input: { sessionId: effectiveSessionId! },
    }),
    // Only try session if we don't have (or failed) orderId load
    enabled:
      !effectiveOrderId &&
      Boolean(effectiveSessionId) &&
      !orderByIdQuery.isLoading &&
      Boolean(orderByIdQuery.error),
    retry: false,
  });

  const finalOrder: Order | undefined =
    orderByIdQuery.data || orderBySessionQuery.data;
  const finalLoading =
    orderByIdQuery.isLoading || orderBySessionQuery.isLoading;
  const hadError =
    (orderByIdQuery.error && !orderByIdQuery.isLoading && !finalOrder) ||
    (orderBySessionQuery.error &&
      !orderBySessionQuery.isLoading &&
      !finalOrder);

  if (finalLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (hadError && !finalOrder) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              We couldn't find your order. This might be because:
            </p>
            <ul className="mt-3 text-left text-sm text-muted-foreground">
              <li>• The payment is still processing</li>
              <li>• The order ID or session ID is incorrect</li>
              <li>• There was an issue with the checkout</li>
            </ul>
            <div className="mt-6 flex gap-2">
              <Button
                onClick={() => router.push("/cart")}
                variant="default"
                className="flex-1"
              >
                Return to Cart
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!finalOrder) {
    // Graceful empty state (shouldn't usually happen)
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              We couldn't find your order. Please check your email for order
              confirmation.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <CardTitle className="text-2xl">Order Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been received and is
            being processed.
          </p>

          <div className="rounded-lg bg-muted p-4 text-left">
            <h3 className="font-semibold">Order Details</h3>
            <p className="text-sm text-muted-foreground">
              Order ID: #{finalOrder.id}
            </p>
            <p className="text-sm text-muted-foreground">
              Status: {finalOrder.status}
            </p>
            {typeof finalOrder.total === "number" && (
              <p className="text-sm text-muted-foreground">
                Total: ${(finalOrder.total / 100).toFixed(2)}
              </p>
            )}
            {finalOrder.customerEmail && (
              <p className="text-sm text-muted-foreground">
                Email: {finalOrder.customerEmail}
              </p>
            )}
          </div>

          {Array.isArray(finalOrder.items) && finalOrder.items.length > 0 && (
            <div className="rounded-lg bg-muted p-4 text-left">
              <h3 className="font-semibold">Order Items</h3>
              <div className="mt-2 space-y-3">
                {finalOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.total / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/categories">Continue Shopping</Link>
            </Button>
            {finalOrder.receiptUrl && (
              <Button asChild className="flex-1">
                <a href={finalOrder.receiptUrl} target="_blank" rel="noopener">
                  View Receipt
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
