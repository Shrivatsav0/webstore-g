//apps/categories/[slug]

"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
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
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Loader2, Home, RefreshCw, ShoppingCart } from "lucide-react";

type SortKey = "newest" | "price-asc" | "price-desc" | "name-asc";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const categoryId = slug ? parseInt(slug) : undefined;

  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [onlyInStock, setOnlyInStock] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    0, 10000,
  ]);

  // Fetch category info
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
    refetch: refetchCategory,
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

  // Fetch products for this category
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    ...orpc.products.list.queryOptions({
      input: {
        page: 1,
        limit: 50, // Get more products for client-side filtering
        categoryId,
        search: query.trim() || undefined,
        isActive: true,
      },
    }),
    enabled: !!categoryId,
    retry: 1,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Filter and sort products client-side
  const filteredProducts = React.useMemo(() => {
    if (!productsData?.data) return [];

    let filtered = productsData.data.filter((product) => {
      const matchesStock = !onlyInStock || (product.stock && product.stock > 0);
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesStock && matchesPrice;
    });

    // Sort products
    switch (sort) {
      case "price-asc":
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // newest
        filtered = filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return filtered;
  }, [productsData?.data, onlyInStock, priceRange, sort]);

  // Update price range when products change
  React.useEffect(() => {
    if (productsData?.data?.length) {
      const prices = productsData.data.map((p) => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange([minPrice, maxPrice]);
    }
  }, [productsData?.data]);

  const isLoading = categoryLoading || productsLoading;
  const error = categoryError || productsError;

  const handleRetry = () => {
    refetchCategory();
    refetchProducts();
  };

  if (!slug || !categoryId) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background text-foreground">
          <section className="container mx-auto px-4 py-10">
            <p className="text-muted-foreground">Loading category…</p>
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
                  Error Loading Category
                </h1>
                <p className="mb-6 text-muted-foreground">
                  Failed to load category or products. Please try again.
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

  if (!category) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background text-foreground">
          <section className="container mx-auto px-4 py-10">
            <h1 className="mb-2 text-2xl font-semibold">Category not found</h1>
            <p className="text-muted-foreground">
              The requested category doesn't exist.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/categories">Back to categories</Link>
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
                  <span className="text-xs text-muted-foreground">
                    Category
                  </span>
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
              Showing {filteredProducts.length} of{" "}
              {productsData?.pagination.total || 0} items in{" "}
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
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
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

            {productsData?.data?.length && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Price</span>
                <div className="w-56">
                  <Slider
                    value={priceRange}
                    onValueChange={(v) =>
                      setPriceRange([v[0], v[1]] as [number, number])
                    }
                    min={Math.min(...productsData.data.map((p) => p.price))}
                    max={Math.max(...productsData.data.map((p) => p.price))}
                    step={50}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  ${Math.round(priceRange[0] / 100)} - $
                  {Math.round(priceRange[1] / 100)}
                </span>
              </div>
            )}
          </div>

          {/* Grid */}
          <CategoryGrid products={filteredProducts} />
        </section>
      </main>
    </>
  );
}

function CategoryGrid({ products }: { products: any[] }) {
  const params = useParams<{ slug: string }>();
  const categoryId = params?.slug; // This should be the category ID

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-lg border border-border/60 bg-muted/20 p-8">
          <h3 className="mb-2 text-xl font-semibold">No products found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p, idx) => (
        <li key={p.id}>
          <Card className="group relative h-[380px] overflow-hidden border-border/60 bg-card/70 transition-all duration-300 hover:shadow-lg">
            {/* Main product link */}
            <Link
              href={`/categories/${categoryId}/${p.id}`}
              aria-label={`View ${p.name}`}
              className="absolute inset-0 z-[1]"
            />

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
                {p.category && (
                  <Badge
                    variant="secondary"
                    className="bg-secondary/50 text-secondary-foreground backdrop-blur"
                  >
                    {p.category.title}
                  </Badge>
                )}
              </div>
              {!p.stock || p.stock === 0 ? (
                <Badge className="bg-muted text-muted-foreground backdrop-blur">
                  Out of stock
                </Badge>
              ) : p.stock < 10 ? (
                <Badge className="bg-orange-500/80 text-white backdrop-blur">
                  Low stock
                </Badge>
              ) : null}
            </div>

            <div className="absolute inset-x-4 bottom-4 z-10">
              <div className="rounded-lg border border-border/60 bg-background/60 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
                <div className="mb-1 flex items-center justify-between">
                  <CardTitle className="line-clamp-1 text-lg">
                    {p.name}
                  </CardTitle>
                  <div className="text-base font-semibold">
                    ${(p.price / 100).toFixed(2)}
                  </div>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {p.description}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {p.stock && (
                      <span className="text-xs text-muted-foreground">
                        {p.stock} in stock
                      </span>
                    )}
                  </div>

                  <div className="relative z-20 flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={!p.stock || p.stock === 0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Navigate to product detail page
                        window.location.href = `/categories/${categoryId}/${p.id}`;
                      }}
                    >
                      <ShoppingCart className="mr-1 size-3" />
                      View Product
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
