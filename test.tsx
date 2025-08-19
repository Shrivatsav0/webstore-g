// apps/web/src/components/cart/cart-button.tsx
"use client";

import * as React from "react";
import { ShoppingCart, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useCartStore } from "../../../stores/cart";
import { CartItems } from "./cart-items";
import { cn } from "@/lib/utils";

export function CartButton() {
  const { itemCount, total } = useCartStore();
  const [isOpen, setIsOpen] = React.useState(false);

  // Animate badge when itemCount changes
  const [prevItemCount, setPrevItemCount] = React.useState(itemCount);
  const [shouldPulse, setShouldPulse] = React.useState(false);

  React.useEffect(() => {
    if (itemCount > prevItemCount) {
      setShouldPulse(true);
      const timer = setTimeout(() => setShouldPulse(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevItemCount(itemCount);
  }, [itemCount, prevItemCount]);

  const formattedTotal = (total / 100).toFixed(2);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative transition-all duration-200 hover:shadow-md",
            itemCount > 0 && "border-primary/20 bg-primary/5"
          )}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="hidden sm:inline text-xs font-medium">
                ${formattedTotal}
              </span>
            )}
          </div>

          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className={cn(
                "absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs font-bold transition-all duration-200",
                shouldPulse && "animate-pulse scale-110"
              )}
            >
              {itemCount > 99 ? "99+" : itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="space-y-2 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <SheetTitle className="text-lg">Shopping Cart</SheetTitle>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
          </div>

          <SheetDescription className="text-left">
            {itemCount === 0 ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                Your cart is empty
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span>
                  {itemCount} item{itemCount === 1 ? "" : "s"} in your cart
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground">
                    Total: ${formattedTotal}
                  </span>
                </div>
              </div>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <CartItems />
        </div>

        {itemCount > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="text-xs text-muted-foreground text-center">
              Secure checkout powered by Stripe
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// apps/web/src/components/cart/cart-items.tsx
("use client");

import * as React from "react";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  Loader2,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
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
  const { validation } = useMinecraftUser();
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
    if (!validation?.isValid) {
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
        <div className="w-full">
          <MinecraftUserDisplay />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Minecraft User Section */}
      <div className="mb-4">
        <MinecraftUserDisplay />
      </div>

      {/* Validation Warning */}
      {!validation?.isValid && (
        <Alert className="mb-4 border-warning bg-warning/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please set a valid Minecraft username before checkout
          </AlertDescription>
        </Alert>
      )}

      <Separator className="mb-4" />

      {/* Cart Items */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {items.map((item, index) => (
          <Card
            key={item.id}
            className="p-3 transition-all duration-200 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={item.product.image || "/placeholder.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <h4 className="text-sm font-medium leading-tight line-clamp-2">
                    {item.product.name}
                  </h4>
                  <p className="text-sm text-primary font-medium mt-1">
                    ${(item.product.price / 100).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 transition-colors"
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

                    <div className="flex h-7 w-12 items-center justify-center rounded border text-sm font-medium bg-muted/30">
                      {item.quantity}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 transition-colors"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={updateItemMutation.isPending}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removeItemMutation.isPending}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {item.quantity > 1 && (
                  <div className="text-xs text-muted-foreground">
                    ${((item.product.price * item.quantity) / 100).toFixed(2)}{" "}
                    total
                  </div>
                )}
              </div>
            </div>
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
          className="w-full h-11 text-base font-medium"
          onClick={handleCheckout}
          disabled={checkoutMutation.isPending || !validation?.isValid}
        >
          {checkoutMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating checkout...
            </>
          ) : (
            "Proceed to Checkout"
          )}
        </Button>

        {!validation?.isValid && (
          <p className="text-xs text-center text-muted-foreground">
            Please set your Minecraft username above to continue
          </p>
        )}
      </div>
    </div>
  );
}

// apps/web/src/components/cart/add-to-cart-button.tsx
("use client");

import * as React from "react";
import { ShoppingCart, Loader2, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "../../../stores/cart";
import { orpc } from "@/utils/orpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MinecraftUsernameModal } from "../minecraft/minecraft-username-modal";
import { useMinecraftUser } from "@/hooks/use-minecraft-user";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productId: number;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "default" | "lg";
}

export function AddToCartButton({
  productId,
  disabled,
  className,
  variant = "default",
  size = "default",
}: AddToCartButtonProps) {
  const { sessionId, generateSessionId } = useCartStore();
  const { hasUsername, mcUser } = useMinecraftUser();
  const [showUsernameModal, setShowUsernameModal] = React.useState(false);
  const [justAdded, setJustAdded] = React.useState(false);
  const queryClient = useQueryClient();

  // Generate session ID if not exists
  React.useEffect(() => {
    if (!sessionId) {
      generateSessionId();
    }
  }, [sessionId, generateSessionId]);

  const addToCartMutation = useMutation(
    orpc.cart.add.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["cart"],
        });
        toast.success("Added to cart");
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      },
      onError: () => {
        toast.error("Failed to add to cart");
      },
    })
  );

  const handleAddToCart = () => {
    if (!sessionId) return;

    // Check if user has Minecraft username
    if (!hasUsername) {
      setShowUsernameModal(true);
      return;
    }

    addToCartMutation.mutate({
      sessionId,
      productId,
      quantity: 1,
    });
  };

  const handleUsernameSuccess = () => {
    // After username is set, add to cart
    if (sessionId) {
      addToCartMutation.mutate({
        sessionId,
        productId,
        quantity: 1,
      });
    }
  };

  const isLoading = addToCartMutation.isPending;
  const isDisabled = disabled || isLoading || !sessionId;

  return (
    <>
      <Button
        onClick={handleAddToCart}
        disabled={isDisabled}
        variant={variant}
        size={size}
        className={cn(
          "transition-all duration-200",
          justAdded && "bg-green-600 hover:bg-green-700",
          className
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : justAdded ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Added!
          </>
        ) : !hasUsername ? (
          <>
            <User className="mr-2 h-4 w-4" />
            {size === "sm" ? "Set Username" : "Set Username & Add to Cart"}
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>

      <MinecraftUsernameModal
        open={showUsernameModal}
        onOpenChange={setShowUsernameModal}
        sessionId={sessionId || ""}
        currentUsername={mcUser?.minecraftUsername}
        onSuccess={handleUsernameSuccess}
      />
    </>
  );
}
