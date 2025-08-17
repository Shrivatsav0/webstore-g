// apps/web/app/checkout/success/page.tsx
"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const { data: order, isLoading } = useQuery({
    ...orpc.checkout.getOrder.queryOptions({
      input: { orderId: parseInt(orderId!) },
    }),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
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
              Order ID: #{order.id}
            </p>
            <p className="text-sm text-muted-foreground">
              Total: ${(order.total / 100).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              Status: {order.status}
            </p>
            <div className="mt-2 space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span>
                    {item.productName} x{item.quantity}
                  </span>
                  <span>${(item.total / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/categories">Continue Shopping</Link>
            </Button>
            {order.receiptUrl && (
              <Button asChild className="flex-1">
                <a href={order.receiptUrl} target="_blank" rel="noopener">
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
