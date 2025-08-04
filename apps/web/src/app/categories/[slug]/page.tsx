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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  // If you have categoriesFull, prefer using it.
  // categoriesFull,
  categoryItems,
  Products as allProducts,
  type Product,
} from "../../../../../../data/data";

type SortKey = "relevance" | "price-asc" | "price-desc" | "rating-desc";

// Helper: derive category object and products by slug if you don't have categoriesFull
function getCategoryBySlug(slug: string) {
  // categoryItems doesn’t include slug in your current file, it uses href.
  // We infer slug from the href (/categories/<slug>) if present, else from title.
  const withSlug = categoryItems.map((c) => {
    const href = c.href || "";
    const match = href.match(/\/categories\/([^/?#]+)/);
    const inferred =
      match?.[1] ||
      c.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return { ...c, slug: inferred };
  });
  return withSlug.find((c) => c.slug === slug) || null;
}

function productsForSlug(slug: string): Product[] {
  // Basic inference by tags based on known slugs
  // Adjust the mapping as your catalog evolves.
  const map: Record<string, string[]> = {
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

  const wantedTags = map[slug];
  if (!wantedTags) {
    // fallback: loose match on slug across tags
    const loose = slug.replace(/-/g, " ").toLowerCase();
    return allProducts.filter((p) =>
      p.tags.some((t) => t.toLowerCase().includes(loose))
    );
  }

  return allProducts.filter((p) =>
    p.tags.some((t) => wantedTags.includes(t.toLowerCase()))
  );
}

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const category = React.useMemo(
    () => (slug ? getCategoryBySlug(slug) : null),
    [slug]
  );

  const baseProducts = React.useMemo(
    () => (slug ? productsForSlug(slug) : []),
    [slug]
  );

  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("relevance");
  const [onlyInStock, setOnlyInStock] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 25000]);

  React.useEffect(() => {
    if (!baseProducts.length) {
      setPriceRange([0, 25000]);
      return;
    }
    const prices = baseProducts.map((p) => p.price);
    setPriceRange([Math.min(...prices), Math.max(...prices)]);
    setOnlyInStock(false);
    setQuery("");
    setSort("relevance");
  }, [slug]); // reset on slug change

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const [min, max] = priceRange;
    let res = baseProducts.filter((p) => {
      const matchesQuery =
        q.length === 0 ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      const matchesStock = !onlyInStock || p.inStock;
      const matchesPrice = p.price >= min && p.price <= max;
      return matchesQuery && matchesStock && matchesPrice;
    });

    switch (sort) {
      case "price-asc":
        res = res.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        res = res.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        res = res.sort((a, b) => b.rating - a.rating);
        break;
      default:
        res = res.sort((a, b) => {
          const aq =
            Number(a.name.toLowerCase().includes(q)) +
            Number(a.description.toLowerCase().includes(q));
          const bq =
            Number(b.name.toLowerCase().includes(q)) +
            Number(b.description.toLowerCase().includes(q));
          if (bq !== aq) return bq - aq;
          return b.rating - a.rating;
        });
    }
    return res;
  }, [baseProducts, query, sort, onlyInStock, priceRange]);

  // Loading/empty states to avoid sync access errors
  if (!slug) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="container mx-auto px-4 py-10">
          <p className="text-muted-foreground">Loading category…</p>
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative h-[260px] overflow-hidden md:h-[320px]">
        <Image
          src={category.image}
          alt={category.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background/90" />
        <div className="container relative z-10 mx-auto flex h-full items-end px-4 py-8">
          <div className="w-full rounded-lg border border-border/60 bg-background/60 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {category.badge ? (
                  <Badge className="bg-secondary/60 text-secondary-foreground">
                    {category.badge}
                  </Badge>
                ) : null}
                <span className="text-xs text-muted-foreground">Category</span>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link href="/categories">All categories</Link>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold md:text-3xl">
              {category.title}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="container mx-auto px-4 py-10">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length} of {baseProducts.length} items in{" "}
            <span className="font-medium text-foreground">
              {category.title}
            </span>
          </p>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
              <Input
                placeholder={`Search ${category.title.toLowerCase()}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-10 backdrop-blur supports-[backdrop-filter]:bg-background/60"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="opacity-70"
                >
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 md:w-56">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating-desc">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Simple filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="in-stock"
              checked={onlyInStock}
              onCheckedChange={(v) => setOnlyInStock(Boolean(v))}
            />
            <label htmlFor="in-stock" className="text-sm">
              In stock only
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Price</span>
            <div className="w-56">
              <Slider
                value={priceRange}
                onValueChange={(v) =>
                  setPriceRange([v[0], v[1]] as [number, number])
                }
                min={
                  baseProducts.length
                    ? Math.min(...baseProducts.map((p) => p.price))
                    : 0
                }
                max={
                  baseProducts.length
                    ? Math.max(...baseProducts.map((p) => p.price))
                    : 25000
                }
                step={50}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              ${Math.round(priceRange[0] / 100)} - $
              {Math.round(priceRange[1] / 100)}
            </span>
          </div>
        </div>

        {/* Grid */}
        <CategoryGrid products={filtered} />
      </section>
    </main>
  );
}

function CategoryGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p, idx) => (
        <li key={p.id}>
          <Card className="group relative h-[380px] overflow-hidden border-border/60 bg-card/70 transition-all duration-300 hover:shadow-lg">
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
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/products/${p.slug ?? p.id}`}>View</Link>
                    </Button>
                    <Button size="sm" disabled={!p.inStock}>
                      Add to cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/60" />
          </Card>
        </li>
      ))}
    </ul>
  );
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

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
