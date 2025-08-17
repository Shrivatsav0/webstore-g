// apps/web/app/checkout/mock/page.tsx
"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function MockCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order");

  const { data: order, isLoading } = useQuery({
    ...orpc.checkout.getOrder.queryOptions({
      input: { orderId: parseInt(orderId!) },
    }),
    enabled: !!orderId,
  });

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      router.push(`/checkout/success?order=${orderId}`);
    }, 2000);
  };

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
              We couldn't find your order.
            </p>
            <Button asChild className="mt-4">
              <a href="/">Continue Shopping</a>
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
          <CardTitle className="text-2xl">Complete Your Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-semibold">Order Summary</h3>
            <p className="text-sm text-muted-foreground">
              Order ID: #{order.id}
            </p>
            <p className="text-sm text-muted-foreground">
              Items: {order.items.length}
            </p>
            <p className="text-lg font-semibold">
              Total: ${(order.total / 100).toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productName} x{item.quantity}
                </span>
                <span>${(item.total / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Button onClick={handlePayment} className="w-full">
            Complete Payment (Mock)
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This is a mock checkout for testing purposes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
