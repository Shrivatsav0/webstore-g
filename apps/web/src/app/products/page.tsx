"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Products as productsData } from "../../../../../data/data";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  image: string;
  tags: string[];
  rating: number; // 0-5
  inStock: boolean;
};

type SortKey = "relevance" | "price-asc" | "price-desc" | "rating-desc";

const normalizeProducts = (raw: any[]): Product[] =>
  raw.map((p: any) => ({
    id: String(p.id ?? p.slug ?? crypto.randomUUID()),
    name: p.name ?? p.title ?? "Untitled",
    description: p.description ?? p.subtitle ?? "",
    price: typeof p.price === "number" ? p.price : Number(p.price ?? 0),
    image: p.image ?? p.img ?? p.cover ?? "/placeholder.svg",
    tags: Array.isArray(p.tags) ? p.tags : [],
    rating:
      typeof p.rating === "number"
        ? p.rating
        : Number(p.rating ?? p.stars ?? 0),
    inStock:
      typeof p.inStock === "boolean"
        ? p.inStock
        : Boolean(p.available ?? p.stock ?? true),
  }));

export default function ProductsPage() {
  const PRODUCTS = React.useMemo(
    () => normalizeProducts(productsData as any[]),
    []
  );

  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("relevance");
  const [onlyInStock, setOnlyInStock] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState<[number, number]>(() => {
    const prices = PRODUCTS.map((p) => p.price);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 25000;
    return [min, max];
  });
  const [activeTags, setActiveTags] = React.useState<string[]>([]);

  const allTags = React.useMemo(() => {
    const t = new Set<string>();
    PRODUCTS.forEach((p) => p.tags.forEach((tag) => t.add(tag)));
    return Array.from(t).sort();
  }, [PRODUCTS]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const [min, max] = priceRange;
    let res = PRODUCTS.filter((p) => {
      const matchesQuery =
        q.length === 0 ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      const matchesStock = !onlyInStock || p.inStock;
      const matchesPrice = p.price >= min && p.price <= max;
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.every((t) => p.tags.includes(t));
      return matchesQuery && matchesStock && matchesPrice && matchesTags;
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
  }, [query, sort, onlyInStock, priceRange, activeTags, PRODUCTS]);

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <main className={cn("min-h-screen bg-background text-foreground")}>
      {/* Decorative top background (matches enhanced style) */}
      <div aria-hidden className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/30 to-background" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/15),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_70%)]">
          <div className="size-full bg-[linear-gradient(to_right,theme(colors.border/40)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/40)_1px,transparent_1px)] bg-[size:36px_36px]" />
        </div>
      </div>

      <section className="container mx-auto px-4 py-10">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Products
            </h1>
            <p className="text-muted-foreground">
              Explore premium ranks, crate keys, cosmetics, and perks.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
              <Input
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-10 backdrop-blur supports-[backdrop-filter]:bg-background/60"
              />
              <div
                className={cn(
                  "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2",
                  "text-muted-foreground"
                )}
              >
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="space-y-6">
            <Card className="border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stock */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="in-stock"
                      checked={onlyInStock}
                      onCheckedChange={(v) => setOnlyInStock(Boolean(v))}
                    />
                    <label
                      htmlFor="in-stock"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      In stock only
                    </label>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-secondary/70 text-secondary-foreground backdrop-blur"
                  >
                    {PRODUCTS.filter((p) => p.inStock).length}
                  </Badge>
                </div>

                <Separator />

                {/* Price */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">Price range</span>
                    <span className="text-sm text-muted-foreground">
                      ${Math.round(priceRange[0] / 100)} - $
                      {Math.round(priceRange[1] / 100)}
                    </span>
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={(v) =>
                      setPriceRange([v[0], v[1]] as [number, number])
                    }
                    min={Math.min(...PRODUCTS.map((p) => p.price), 0)}
                    max={Math.max(...PRODUCTS.map((p) => p.price), 25000)}
                    step={50}
                    className="py-2"
                  />
                </div>

                <Separator />

                {/* Tags */}
                <div>
                  <div className="mb-3 text-sm font-medium">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => {
                      const active = activeTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs transition-all",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setQuery("");
                    setSort("relevance");
                    setOnlyInStock(false);
                    const prices = PRODUCTS.map((p) => p.price);
                    setPriceRange([
                      prices.length ? Math.min(...prices) : 0,
                      prices.length ? Math.max(...prices) : 25000,
                    ]);
                    setActiveTags([]);
                  }}
                >
                  Reset
                </Button>
                <Button>Apply</Button>
              </CardFooter>
            </Card>

            {/* Promo / Help card to match style */}
            <Card className="border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Need help?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Questions about ranks or crate keys? Visit Support to learn how
                purchases are delivered instantly.
              </CardContent>
              <CardFooter>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/support">Go to Support</Link>
                </Button>
              </CardFooter>
            </Card>
          </aside>

          {/* Results */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filtered.length} of {PRODUCTS.length} products
              </p>
            </div>

            {/* Modern overlay grid */}
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p, idx) => (
                <li key={p.id}>
                  <Card
                    className={cn(
                      "group relative h-[380px] overflow-hidden border-border/60 bg-card/70",
                      "transition-all duration-300 hover:shadow-lg"
                    )}
                  >
                    {/* Background image */}
                    <div className="absolute inset-0">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        priority={idx < 3}
                      />
                      {/* Layered gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-background/10" />
                    </div>

                    {/* Top badges */}
                    <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {p.tags.slice(0, 3).map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="bg-secondary/70 text-secondary-foreground backdrop-blur"
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

                    {/* Floating info bar */}
                    <div className="absolute inset-x-4 bottom-4 z-10">
                      <div className="rounded-lg border border-border/60 bg-background/60 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
                        <div className="mb-1 flex items-center justify-between">
                          <CardTitle className="line-clamp-1 text-lg">
                            {p.name}
                          </CardTitle>
                          <div className="text-base font-semibold">
                            ${Math.round(p.price / 100)}
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
                              <Link href={`/products/${p.id}`}>View</Link>
                            </Button>
                            <Button
                              size="sm"
                              className="disabled:opacity-60"
                              disabled={!p.inStock}
                            >
                              Add to cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subtle inner border */}
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/60" />
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
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
