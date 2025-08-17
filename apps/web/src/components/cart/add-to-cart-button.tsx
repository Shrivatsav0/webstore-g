// apps/web/src/components/cart/add-to-cart-button.tsx
"use client";

import * as React from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "../../../stores/cart";
import { orpc } from "@/utils/orpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: number;
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({
  productId,
  disabled,
  className,
}: AddToCartButtonProps) {
  const { sessionId, generateSessionId } = useCartStore();
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
      },
      onError: () => {
        toast.error("Failed to add to cart");
      },
    })
  );

  const handleAddToCart = () => {
    if (!sessionId) return;

    addToCartMutation.mutate({
      sessionId,
      productId,
      quantity: 1,
    });
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || addToCartMutation.isPending || !sessionId}
      className={className}
    >
      {addToCartMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
