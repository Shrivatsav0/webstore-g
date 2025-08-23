//app/categories/[slug]/[productSlug]

"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  Loader2,
  Home,
  RefreshCw,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string; productSlug: string }>();
  const categoryId = params?.slug ? parseInt(params.slug) : undefined;
  const productId = params?.productSlug
    ? parseInt(params.productSlug)
    : undefined;

  // Fetch product details
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
    refetch: refetchProduct,
  } = useQuery({
    ...orpc.products.get.queryOptions({
      input: { id: productId! },
    }),
    enabled: !!productId,
    retry: 1,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch category info
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useQuery({
    ...orpc.categories.get.queryOptions({
      input: { id: categoryId! },
    }),
    enabled: !!categoryId,
    retry: 1,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch related products from the same category
  const { data: relatedProductsData, isLoading: relatedLoading } = useQuery({
    ...orpc.products.list.queryOptions({
      input: {
        page: 1,
        limit: 6,
        categoryId,
        isActive: true,
      },
    }),
    enabled: !!categoryId && !!product,
    retry: 1,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const isLoading = productLoading || categoryLoading;
  const error = productError || categoryError;

  const handleRetry = () => {
    refetchProduct();
  };

  if (!categoryId || !productId) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background text-foreground">
          <section className="container mx-auto px-4 py-10">
            <p className="text-muted-foreground">Loading product…</p>
          </section>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background text-foreground">
          <section className="container mx-auto px-4 py-10">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-8 rounded-lg border border-destructive/20 bg-destructive/5 p-8 backdrop-blur">
                <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Error Loading Product
                </h1>
                <p className="mb-6 text-muted-foreground">
                  Failed to load product details. Please try again.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button
                    onClick={handleRetry}
                    variant="default"
                    className="w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 size-4" />
                        Try Again
                      </>
                    )}
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Link href="/categories">
                      <Home className="mr-2 size-4" />
                      Back to Categories
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background text-foreground">
          <section className="container mx-auto px-4 py-10">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin" />
            </div>
          </section>
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background text-foreground">
          <section className="container mx-auto px-4 py-10">
            <h1 className="mb-2 text-2xl font-semibold">Product not found</h1>
            <p className="text-muted-foreground">
              We couldn't find that product.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild variant="secondary">
                <Link href={`/categories/${categoryId}`}>
                  <ArrowLeft className="mr-2 size-4" />
                  Back to {category?.title || "Category"}
                </Link>
              </Button>
              <Button asChild>
                <Link href="/categories">All categories</Link>
              </Button>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative h-[300px] overflow-hidden md:h-[380px]">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background/90" />
          <div className="container relative z-10 mx-auto flex h-full items-end px-4 py-8">
            <div className="w-full rounded-lg border border-border/60 bg-background/60 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Link
                    href="/categories"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Categories
                  </Link>
                  <span className="text-muted-foreground">/</span>
                  <Link
                    href={`/categories/${categoryId}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {category?.title || "Category"}
                  </Link>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-foreground">{product.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {category && (
                    <Badge className="bg-secondary/60 text-secondary-foreground">
                      {category.title}
                    </Badge>
                  )}
                </div>
              </div>

              <h1 className="text-2xl font-semibold md:text-3xl">
                {product.name}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                {product.description}
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Image and metadata */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Image card */}
              <Card className="group relative overflow-hidden rounded-2xl border-border/60 bg-card/70 py-0">
                <div className="relative aspect-video w-full">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="rounded-2xl object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-background/10 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-border/60" />
                </div>
              </Card>

              {/* Details card */}
              <Card className="rounded-2xl border-border/60 bg-card/70 mt-3 py-5">
                <CardContent className="flex flex-col justify-end gap-4 p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="max-w-[70%]">
                      <h3 className="line-clamp-2 text-base font-medium text-foreground/90 sm:text-lg">
                        {product.name}
                      </h3>
                    </div>
                    <div className="shrink-0 text-2xl font-bold tracking-tight sm:text-3xl">
                      {formatCents(product.price)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/80">Category</span>
                    <span className="text-xs text-foreground/80">
                      {category?.title || "Unknown"}
                    </span>
                  </div>



                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/80">
                      Availability
                    </span>
                    <span className="text-xs text-emerald-400">
                      Available
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between gap-3 p-4 sm:p-6">
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-secondary/80 text-secondary-foreground backdrop-blur supports-[backdrop-filter]:backdrop-blur-md"
                  >
                    <Link href={`/categories/${categoryId}`}>
                      <ArrowLeft className="mr-2 size-4" />
                      Back to {category?.title || "Category"}
                    </Link>
                  </Button>
                  <AddToCartButton
                    productId={product.id}
                    disabled={false}
                    className="relative z-20"
                  />
                </CardFooter>
              </Card>
            </div>

            {/* Right: Description and details */}
            <div className="lg:col-span-2">
              <Card className="border-border/60 bg-card/70">
                <CardHeader>
                  <CardTitle>About this item</CardTitle>
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
                        <li>Category: {category?.title || "Unknown"}</li>
                        <li>Price: {formatCents(product.price)}</li>
                        <li>
                          Status: {product.isActive ? "Active" : "Inactive"}
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-medium">
                        Purchase info
                      </h3>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>Delivery: Instant for most items after purchase</li>
                        <li>Refunds: See refund policy for eligibility</li>
                        <li>
                          Support: Contact us with your order ID if needed
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related products */}
              <div className="mt-6">
                <RelatedProducts
                  products={relatedProductsData?.data || []}
                  currentProductId={product.id}
                  categoryId={categoryId}
                  categoryTitle={category?.title || "Category"}
                  isLoading={relatedLoading}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function RelatedProducts({
  products,
  currentProductId,
  categoryId,
  categoryTitle,
  isLoading,
}: {
  products: any[];
  currentProductId: number;
  categoryId: number;
  categoryTitle: string;
  isLoading: boolean;
}) {
  // Filter out current product and limit to 6
  const relatedProducts = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 6);

  if (isLoading) {
    return (
      <div>
        <h3 className="mb-4 text-base font-semibold">
          More in {categoryTitle}
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[340px] animate-pulse rounded-lg bg-muted/20"
            />
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div>
        <h3 className="mb-4 text-base font-semibold">
          More in {categoryTitle}
        </h3>
        <div className="rounded-lg border border-border/60 bg-muted/20 p-8 text-center">
          <p className="text-muted-foreground">
            No other products found in this category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold">More in {categoryTitle}</h3>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {relatedProducts.map((product, idx) => (
          <li key={product.id}>
            <Card className="group relative h-[340px] overflow-hidden border-border/60 bg-card/70 transition-all duration-300 hover:shadow-lg">
              <Link
                href={`/categories/${categoryId}/${product.id}`}
                className="absolute inset-0 z-[1]"
              />

              <div className="absolute inset-0">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  priority={idx < 3}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-background/10" />
              </div>

              <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {product.category && (
                    <Badge
                      variant="secondary"
                      className="bg-secondary/50 text-secondary-foreground backdrop-blur"
                    >
                      {product.category.title}
                    </Badge>
                  )}
                </div>
                {!product.stock || product.stock === 0 ? (
                  <Badge className="bg-muted text-muted-foreground backdrop-blur">
                    Out of stock
                  </Badge>
                ) : product.stock < 10 ? (
                  <Badge className="bg-orange-500/80 text-white backdrop-blur">
                    Low stock
                  </Badge>
                ) : null}
              </div>

              <div className="absolute inset-x-4 bottom-4 z-10">
                <div className="rounded-lg border border-border/60 bg-background/60 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
                  <div className="mb-1 flex items-center justify-between">
                    <CardTitle className="line-clamp-1 text-lg">
                      {product.name}
                    </CardTitle>
                    <div className="text-base font-semibold">
                      {formatCents(product.price)}
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {product.stock && (
                        <span className="text-xs text-muted-foreground">
                          {product.stock} in stock
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Navigate to product
                        window.location.href = `/categories/${categoryId}/${product.id}`;
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/60" />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
