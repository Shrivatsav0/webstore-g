// apps/web/src/components/cart/cart-items.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "../../../stores/cart";
import { orpc } from "@/utils/orpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function CartItems() {
  const { sessionId, items, total, setCart, setLoading, generateSessionId } =
    useCartStore();
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

  // Checkout mutation
  const checkoutMutation = useMutation(
    orpc.checkout.create.mutationOptions({
      onSuccess: (data: { checkoutUrl: string; orderId: number }) => {
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
    updateItemMutation.mutate({
      sessionId,
      itemId,
      quantity,
    });
  };

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate({
      sessionId,
      itemId,
    });
  };

  const handleCheckout = () => {
    checkoutMutation.mutate({
      sessionId,
      redirectUrl: `${window.location.origin}/checkout/success`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex-1 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-md border">
              <Image
                src={item.product.image || "/placeholder.svg"}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-medium leading-none">
                {item.product.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                ${(item.product.price / 100).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                disabled={updateItemMutation.isPending}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                disabled={updateItemMutation.isPending}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemoveItem(item.id)}
                disabled={removeItemMutation.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span>Subtotal</span>
          <span>${(total / 100).toFixed(2)}</span>
        </div>
        <Button
          className="w-full"
          onClick={handleCheckout}
          disabled={checkoutMutation.isPending}
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
      </div>
    </div>
  );
}
