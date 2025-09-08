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
import Link from "next/link";

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
              asChild
              variant="destructive"
              className={cn(
                "absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs font-bold transition-all duration-200",
                shouldPulse && "animate-pulse scale-110"
              )}
            >
              <span>{itemCount > 99 ? "99+" : itemCount}</span>
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
                {/* <X className="h-4 w-4" /> */}
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
          </div>

          <div className="text-left text-sm text-muted-foreground">
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
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <CartItems />
        </div>

        {itemCount > 0 && (
          <div className="border-t py-4 mt-4">
            <div className="flex flex-col text-xs text-muted-foreground text-center">
              Secure checkout powered by Lemonsqueezy
              <span>
                By proceeding you will be agreeing to our
                <span>
                  <Link href="/tos" className="text-blue-400">
                    {" "}
                    terms and condition{" "}
                  </Link>
                </span>
                as well as our
                <span>
                  <Link href="/policy" className="text-blue-400">
                    {" "}
                    privacy policy{" "}
                  </Link>
                </span>
              </span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
