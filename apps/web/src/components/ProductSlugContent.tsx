"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StarIcon, Copy, Share2, Check } from "lucide-react";
// Optional toast; replace with your own
// import { useToast } from "@/components/ui/use-toast";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          className={cn(
            i < filled ? "text-primary" : "text-muted-foreground/40"
          )}
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          />
        </svg>
      ))}
    </div>
  );
}

export function ProductSection({
  category,
  product,
}: {
  category: {
    slug: string;
    title: string;
    badge?: string;
  };
  product: {
    id: string;
    name: string;
    description: string;
    image?: string;
    price: number;
    compareAtPrice?: number;
    discountPercent?: number;
    rating: number;

    sku?: string;
    tags?: string[];
    isNew?: boolean;
    slug?: string;
  };
}) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);


  const priceHasDiscount =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  const handleCopySku = async () => {
    if (!product.sku) return;
    try {
      await navigator.clipboard.writeText(product.sku);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (_) {
      // fallback
      alert("Copied!");
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Check out ${product.name} on our store`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url });
      } catch {
        // no-op if cancelled
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      // toast({ title: "Link copied", description: "Product URL copied." });
      alert("Link copied to clipboard");
    } catch {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <section className="container mx-auto px-4 py-10">
      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 border-t border-border/60 px-4 py-3 md:hidden">
        <div className="mx-auto flex max-w-screen-md items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold">
              {formatCents(product.price)}
            </span>
            {priceHasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCents(product.compareAtPrice!)}
              </span>
            )}
            {product.discountPercent ? (
              <Badge className="ml-1 bg-emerald-500/80 text-emerald-50">
                -{product.discountPercent}%
              </Badge>
            ) : null}
          </div>
          <Button size="sm" onClick={() => {}}>
            Add to cart
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Image and metadata (card) */}
        <Card className="group overflow-hidden border-border/60 bg-card/70 transition-all duration-300 hover:shadow-lg">
          <div className="relative h-[260px] w-full">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              priority
            />
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-border/60" />

            {/* Top-left badges */}
            <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
              {category.badge ? (
                <Badge className="bg-secondary/60 text-secondary-foreground backdrop-blur">
                  {category.badge}
                </Badge>
              ) : null}
              {product.isNew ? (
                <Badge className="bg-blue-500/80 text-blue-50 backdrop-blur">
                  New
                </Badge>
              ) : null}
              {product.discountPercent ? (
                <Badge className="bg-emerald-500/80 text-emerald-50 backdrop-blur">
                  -{product.discountPercent}%
                </Badge>
              ) : null}
            </div>
          </div>

          <CardContent className="space-y-4 p-4">
            {/* Price row with compare-at */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <div className="flex items-baseline gap-2">
                <div className="text-lg font-semibold">
                  {formatCents(product.price)}
                </div>
                {priceHasDiscount && (
                  <div className="text-xs text-muted-foreground line-through">
                    {formatCents(product.compareAtPrice!)}
                  </div>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rating</span>
              <div className="flex items-center gap-2">
                <StarRating rating={product.rating} />
                <span className="text-xs text-muted-foreground">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            </div>



            {/* SKU + copy */}
            {product.sku ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">SKU</span>
                <button
                  onClick={handleCopySku}
                  className="inline-flex items-center gap-1 text-xs text-foreground hover:underline"
                  aria-label="Copy SKU"
                >
                  <span className="font-mono">{product.sku}</span>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ) : null}

            {/* Tags */}
            {product.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="bg-secondary/50 text-secondary-foreground"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            ) : null}

            {/* Share */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm text-muted-foreground">Share</span>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={() => {
                    const url =
                      typeof window !== "undefined" ? window.location.href : "";
                    window.open(
                      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                        url
                      )}&text=${encodeURIComponent(
                        `Check out ${product.name}`
                      )}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                >
                  Tweet
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between gap-3 p-4">
            <Button asChild variant="secondary">
              <Link href={`/categories/${category.slug}`}>
                Back to {category.title}
              </Link>
            </Button>
            <Button
              onClick={() => {
                // add to cart
              }}
            >
              Add to cart
            </Button>
          </CardFooter>
        </Card>

        {/* Right: Description and details */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 bg-card/70">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle>About this item</CardTitle>
              <div className="flex items-center gap-2">
                {product.discountPercent ? (
                  <Badge className="bg-emerald-500/80 text-emerald-50">
                    Save {product.discountPercent}%
                  </Badge>
                ) : null}
                {product.isNew ? (
                  <Badge className="bg-blue-500/80 text-blue-50">Just in</Badge>
                ) : null}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
              <Separator />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Key details</h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Category: {category.title}</li>
                    <li>Delivery: Instant for most items after purchase</li>
                    <li>Refunds: See refund policy for eligibility</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium">Tips</h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Ensure your Minecraft username is correct</li>
                    <li>
                      Relog if delivery doesn’t arrive within a few minutes
                    </li>
                    <li>Contact support with your order ID if needed</li>
                  </ul>
                </div>
              </div>

              {/* Collapsible extra details */}
              <details className="group rounded-md border border-border/60 bg-muted/10 p-4">
                <summary className="cursor-pointer select-none text-sm font-medium text-foreground/90 marker:hidden">
                  More details
                </summary>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    This product is delivered automatically on supported
                    servers. If you face delays, please verify your IGN and
                    reconnect.
                  </p>
                  <p>
                    By purchasing, you agree to our Terms of Service and Refund
                    Policy. Some items are non-refundable.
                  </p>
                </div>
              </details>
            </CardContent>
          </Card>

          {/* Optional: Related items from the same category */}
          <div className="mt-6">
            {/* Keep your existing RelatedFromCategory component */}
          </div>
        </div>
      </div>
    </section>
  );
}
