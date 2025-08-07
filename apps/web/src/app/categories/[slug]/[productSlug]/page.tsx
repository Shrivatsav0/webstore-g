"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  categoriesFull,
  categoryItems,
  Products,
  type Product,
} from "../../../../../../../data/data";
import { Header } from "@/components/header";

type CategoryResolved = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  badge?: string;
  products?: Product[];
  sections?: {
    id: string;
    title: string;
    description?: string;
    products: Product[];
  }[];
} | null;

function getCategoryBySlug(slug: string): CategoryResolved {
  // Prefer full categories
  const full = categoriesFull.find((c) => c.slug === slug);
  if (full) return full;

  // Fallback to categoryItems (no products there)
  const item = categoryItems.find((c) => {
    const href = c.href || "";
    const m = href.match(/\/categories\/([^/?#]+)/);
    const inferred =
      m?.[1] ||
      c.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    return inferred === slug;
  });

  if (!item) return null;

  return {
    id: item.id,
    slug,
    title: item.title,
    description: item.description,
    image: item.image,
    badge: item.badge,
    products: undefined,
    sections: undefined,
  };
}

// Find a product inside a category, searching sections then flat products
function findProductInCategory(
  category: CategoryResolved,
  productSlug: string
) {
  if (!category) return null;

  const inSections =
    category.sections
      ?.flatMap((s) => s.products)
      .find((p) => (p.slug || p.id) === productSlug) || null;

  if (inSections) return inSections;

  const inFlat =
    category.products?.find((p) => (p.slug || p.id) === productSlug) || null;

  if (inFlat) return inFlat;

  // Fallback: loosely match from global Products by tags relevant to category
  const tagMap: Record<string, string[]> = {
    ranks: ["rank"],
    "crate-keys": ["crate", "key"],
    cosmetics: ["cosmetic", "pet", "hat", "effect", "trail", "aura"],
    boosters: ["booster"],
    perks: ["perk"],
    bundles: ["bundle"],
    pets: ["pet"],
    titles: ["title"],
    misc: ["misc"],
  };
  const wanted = tagMap[category.slug];
  if (!wanted) return null;

  return (
    Products.find(
      (p) =>
        (p.slug || p.id) === productSlug &&
        p.tags.some((t) => wanted.includes(t.toLowerCase()))
    ) || null
  );
}

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

export default function ProductDetailPage() {
  const params = useParams<{ slug: string; productSlug: string }>();
  const slug = params?.slug;
  const productSlug = params?.productSlug;

  const category = React.useMemo(
    () => (slug ? getCategoryBySlug(slug) : null),
    [slug]
  );

  const product = React.useMemo(
    () =>
      slug && productSlug ? findProductInCategory(category, productSlug) : null,
    [slug, productSlug, category]
  );

  if (!slug || !productSlug) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="container mx-auto px-4 py-10">
          <p className="text-muted-foreground">Loading product…</p>
        </section>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="container mx-auto px-4 py-10">
          <h1 className="mb-2 text-2xl font-semibold">Category not found</h1>
          <p className="text-muted-foreground">
            The requested category “{slug}” doesn’t exist.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/categories">Back to categories</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="container mx-auto px-4 py-10">
          <h1 className="mb-2 text-2xl font-semibold">Product not found</h1>
          <p className="text-muted-foreground">
            We couldn’t find that product in {category.title}.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="secondary">
              <Link href={`/categories/${category.slug}`}>
                Back to {category.title}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/categories">All categories</Link>
            </Button>
          </div>
        </section>
      </main>
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
                    href={`/categories/${category.slug}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {category.title}
                  </Link>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-foreground">{product.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {category.badge ? (
                    <Badge className="bg-secondary/60 text-secondary-foreground">
                      {category.badge}
                    </Badge>
                  ) : null}
                  {product.discountPercent ? (
                    <Badge className="bg-emerald-500/80 text-emerald-50">
                      -{product.discountPercent}%
                    </Badge>
                  ) : null}
                  {!product.inStock && (
                    <Badge className="bg-muted text-muted-foreground">
                      Out of stock
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
            {/* Left: Image and metadata (card) */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Image-only card */}
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

              {/* Details card below image */}
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
                    <span className="text-sm text-foreground/80">Rating</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={product.rating} />
                      <span className="text-xs text-foreground/80">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/80">
                      Availability
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        product.inStock
                          ? "text-emerald-400"
                          : "text-foreground/70"
                      )}
                    >
                      {product.inStock ? "In stock" : "Out of stock"}
                    </span>
                  </div>

                  {product.tags?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="bg-secondary/60 text-secondary-foreground/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>

                <CardFooter className="flex items-center justify-between gap-3 p-4 sm:p-6">
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-secondary/80 text-secondary-foreground backdrop-blur supports-[backdrop-filter]:backdrop-blur-md"
                  >
                    <Link href={`/categories/${category.slug}`}>
                      Back to {category.title}
                    </Link>
                  </Button>
                  <Button
                    disabled={!product.inStock}
                    className="bg-primary/90 hover:bg-primary text-primary-foreground backdrop-blur supports-[backdrop-filter]:backdrop-blur-md"
                  >
                    Add to cart
                  </Button>
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
                </CardContent>
              </Card>

              {/* Optional: Related items from the same category */}
              <div className="mt-6">
                <RelatedFromCategory
                  category={category}
                  currentId={product.id}
                  currentSlug={product.slug || product.id}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function RelatedFromCategory({
  category,
  currentId,
  currentSlug,
}: {
  category: NonNullable<ReturnType<typeof getCategoryBySlug>>;
  currentId: string;
  currentSlug: string;
}) {
  const products: Product[] = React.useMemo(() => {
    const fromSections = category.sections?.flatMap((s) => s.products) ?? [];
    const flat = category.products ?? [];
    const all = [...fromSections, ...flat];
    return all.filter((p) => p.id !== currentId).slice(0, 6);
  }, [category, currentId]);

  if (!products.length) return null;

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold">More in {category.title}</h3>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p, idx) => (
          <li key={p.id}>
            <Card className="group relative h-[340px] overflow-hidden border-border/60 bg-card/70 transition-all duration-300 hover:shadow-lg">
              <div className="absolute inset-0">
                <Image
                  src={p.image || "/placeholder.svg"}
                  alt={p.name}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  priority={idx < 3}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-background/10" />
              </div>
              <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {p.tags.slice(0, 2).map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="bg-secondary/50 text-secondary-foreground backdrop-blur"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
                {!p.inStock && (
                  <Badge className="bg-muted text-muted-foreground backdrop-blur">
                    Out of stock
                  </Badge>
                )}
              </div>
              <div className="absolute inset-x-4 bottom-4 z-10">
                <div className="rounded-lg border border-border/60 bg-background/60 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
                  <div className="mb-1 flex items-center justify-between">
                    <CardTitle className="line-clamp-1 text-lg">
                      {p.name}
                    </CardTitle>
                    <div className="text-base font-semibold">
                      {formatCents(p.price)}
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StarRating rating={p.rating} />
                      <span className="text-xs text-muted-foreground">
                        {p.rating.toFixed(1)}
                      </span>
                    </div>
                    <Button asChild size="sm" variant="secondary">
                      <Link
                        href={`/categories/${category.slug}/${p.slug ?? p.id}`}
                      >
                        View
                      </Link>
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
