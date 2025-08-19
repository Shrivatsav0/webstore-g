// apps/web/src/components/cart/cart-items.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  Loader2,
  ShoppingBag,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCartStore } from "../../../stores/cart";
import { orpc } from "@/utils/orpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MinecraftUserDisplay } from "@/components/checkout/minecraft-user-display";
import { useMinecraftUser } from "@/hooks/use-minecraft-user";
import { cn } from "@/lib/utils";

export function CartItems() {
  const { sessionId, items, total, setCart, generateSessionId, clearCart } =
    useCartStore();
  const { validation, hasUsername, isValid } = useMinecraftUser();
  const queryClient = useQueryClient();

  // Generate session ID if not exists
  React.useEffect(() => {
    if (!sessionId) {
      generateSessionId();
    }
  }, [sessionId, generateSessionId]);

  // Fetch cart data
  const { data: cartData, isLoading } = useQuery({
    ...orpc.cart.get.queryOptions({
      input: { sessionId },
    }),
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
  });

  // Update cart store when data changes
  React.useEffect(() => {
    if (cartData) {
      setCart({
        items: cartData.items,
        itemCount: cartData.itemCount,
        total: cartData.total,
      });
    }
  }, [cartData, setCart]);

  // Update item mutation
  const updateItemMutation = useMutation(
    orpc.cart.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.cart.get.queryKey({ input: { sessionId } }),
        });
      },
      onError: () => {
        toast.error("Failed to update cart item");
      },
    })
  );

  // Remove item mutation
  const removeItemMutation = useMutation(
    orpc.cart.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.cart.get.queryKey({ input: { sessionId } }),
        });
        toast.success("Item removed from cart");
      },
      onError: () => {
        toast.error("Failed to remove item");
      },
    })
  );

  // Server-side clear cart
  const clearServerCartMutation = useMutation(
    orpc.cart.clear.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.cart.get.queryKey({ input: { sessionId } }),
        });
      },
    })
  );

  // Checkout mutation
  const checkoutMutation = useMutation(
    orpc.checkout.create.mutationOptions({
      onSuccess: (data: { checkoutUrl: string; orderId: number }) => {
        // Option A — Optimistic clear locally before redirect
        clearCart();
        queryClient.invalidateQueries({
          queryKey: orpc.cart.get.queryKey({ input: { sessionId } }),
        });

        // Optional: mark optimistic clear for debugging/reconciliation
        try {
          sessionStorage.setItem("checkout:optimistic-cleared", "1");
        } catch {}

        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      },
      onError: () => {
        toast.error("Failed to create checkout session");
      },
    })
  );

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    const nextQty = Math.max(1, quantity); // clamp to >= 1
    updateItemMutation.mutate({
      sessionId,
      itemId,
      quantity: nextQty,
    });
  };

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate({
      sessionId,
      itemId,
    });
  };

  const handleCheckout = () => {
    if (!hasUsername) {
      toast.error("Please set a Minecraft username before checkout");
      return;
    }

    if (!isValid) {
      toast.error("Please set a valid Minecraft username before checkout");
      return;
    }

    checkoutMutation.mutate({
      sessionId,
      redirectUrl: `${window.location.origin}/checkout/success`,
    });
  };

  // Option B — Definitive clear once on the success page
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionId) return;

    const url = new URL(window.location.href);
    const isSuccess = url.pathname.startsWith("/checkout/success");
    if (!isSuccess) return;

    (async () => {
      try {
        await clearServerCartMutation.mutateAsync({ sessionId });
      } catch {
        // ignore errors; we still clear local
      } finally {
        clearCart();
        queryClient.invalidateQueries({
          queryKey: orpc.cart.get.queryKey({ input: { sessionId } }),
        });
        try {
          sessionStorage.removeItem("checkout:optimistic-cleared");
        } catch {}
      }
    })();
  }, [sessionId, clearServerCartMutation, clearCart, queryClient]);

  // Determine validation state for UI
  const canCheckout = hasUsername && isValid;
  const validationError = !hasUsername
    ? "Minecraft username required"
    : !isValid
    ? "Invalid Minecraft username"
    : null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading your cart...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Start shopping to add items to your cart
          </p>
        </div>
        <div className="w-full max-w-md">
          <MinecraftUserDisplay showForEmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4">
      {/* Minecraft User Section */}
      <div className="mb-4">
        <MinecraftUserDisplay />
      </div>

      {/* Enhanced Validation Warning */}
      {validationError && (
        <Alert
          className={cn(
            "mb-4",
            !hasUsername
              ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
          )}
        >
          <AlertCircle
            className={cn(
              "h-4 w-4",
              !hasUsername ? "text-orange-600" : "text-red-600"
            )}
          />
          <AlertDescription
            className={cn(
              !hasUsername
                ? "text-orange-800 dark:text-orange-200"
                : "text-red-800 dark:text-red-200"
            )}
          >
            {validationError}
          </AlertDescription>
        </Alert>
      )}

      <Separator className="mb-4" />

      {/* Cart Items - Categories Style Design */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {items.map((item, index) => (
          <Card
            key={item.id}
            className="group relative h-64 overflow-hidden border-border/60 bg-card/70 transition-all duration-300 hover:shadow-lg"
          >
            {/* Background image */}
            <div className="absolute inset-0">
              <Image
                src={item.product.image || "/placeholder.svg"}
                alt={item.product.name}
                fill
                sizes="400px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                priority={index < 3}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
            </div>

            {/* Floating content */}
            <div className="absolute inset-2 z-10 flex items-end">
              <div className="flex-1 rounded-lg border border-border/60 bg-background/60 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/40">
                <div className="flex items-start gap-3">
                  {/* Product Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-medium leading-tight line-clamp-1">
                          {item.product.name}
                        </CardTitle>
                        <p className="text-sm text-primary font-medium">
                          ${(item.product.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 transition-colors backdrop-blur supports-[backdrop-filter]:bg-background/60"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={
                            updateItemMutation.isPending || item.quantity <= 1
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <div className="flex h-6 w-10 items-center justify-center rounded border text-xs font-medium bg-background/60 backdrop-blur">
                          {item.quantity}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 transition-colors backdrop-blur supports-[backdrop-filter]:bg-background/60"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={updateItemMutation.isPending}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.quantity > 1 && (
                          <div className="text-xs text-muted-foreground">
                            $
                            {(
                              (item.product.price * item.quantity) /
                              100
                            ).toFixed(2)}{" "}
                            total
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 backdrop-blur"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeItemMutation.isPending}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inner border */}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/60" />
          </Card>
        ))}
      </div>

      {/* Checkout Section */}
      <div className="mt-4 space-y-4 border-t pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${(total / 100).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax & Fees</span>
            <span className="text-muted-foreground">
              Calculated at checkout
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between font-medium">
          <span>Total</span>
          <span className="text-lg">${(total / 100).toFixed(2)}</span>
        </div>

        <Button
          className={cn(
            "w-full h-11 text-base font-medium transition-all",
            !canCheckout && "opacity-60"
          )}
          onClick={handleCheckout}
          disabled={checkoutMutation.isPending || !canCheckout}
        >
          {checkoutMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating checkout...
            </>
          ) : !canCheckout ? (
            <>
              <Lock className="mr-2 h-4 w-4" />
              {!hasUsername
                ? "Set Username to Checkout"
                : "Fix Username to Checkout"}
            </>
          ) : (
            "Proceed to Checkout"
          )}
        </Button>

        {!canCheckout && (
          <div className="text-xs text-center space-y-1">
            <p className="text-muted-foreground">
              {!hasUsername
                ? "Please set your Minecraft username above to continue"
                : "Please fix your Minecraft username to continue"}
            </p>
            {!hasUsername && (
              <p className="text-primary">
                Click "Add Username" above to get started
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
