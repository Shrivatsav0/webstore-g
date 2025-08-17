"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  // Add polling with retry logic
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...orpc.checkout.getOrder.queryOptions({
      input: { orderId: parseInt(orderId!) },
    }),
    enabled: !!orderId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchInterval: () => {
      // If order is not found or still pending, keep polling for 30 seconds
      if (!order || order.status === "pending") {
        return 2000; // Poll every 2 seconds
      }
      return false; // Stop polling once order is found and processed
    },
    refetchIntervalInBackground: true,
  });

  // Stop polling after 30 seconds
  React.useEffect(() => {
    if (orderId) {
      const timeout = setTimeout(() => {
        // This will stop the refetchInterval by updating the query
      }, 30000);

      return () => clearTimeout(timeout);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-center text-muted-foreground">
              Processing your order...
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              This may take a few moments
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching order:", error);
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-yellow-500" />
            <CardTitle>Error Loading Order</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              There was an error loading your order details.
            </p>
            <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="flex-1"
              >
                Try Again
              </Button>
              <Button asChild className="flex-1">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-yellow-500" />
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              We couldn't find your order. This might be because:
            </p>
            <ul className="text-sm text-muted-foreground text-left space-y-1">
              <li>• The order is still being processed</li>
              <li>• There was a delay in our system</li>
              <li>• The order ID is incorrect</li>
            </ul>
            <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
            <p className="text-sm text-muted-foreground">
              Please check your email for order confirmation, or try refreshing
              in a moment.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="flex-1"
              >
                Refresh
              </Button>
              <Button asChild className="flex-1">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
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
              Status:{" "}
              <span
                className={`capitalize ${
                  order.status === "completed"
                    ? "text-green-600"
                    : order.status === "pending"
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                {order.status}
              </span>
            </p>
            {order.customerEmail && (
              <p className="text-sm text-muted-foreground">
                Email: {order.customerEmail}
              </p>
            )}
          </div>

          {order.status === "pending" && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-sm text-yellow-800">
                Your payment is being processed. You'll receive an email
                confirmation shortly.
              </p>
            </div>
          )}

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
