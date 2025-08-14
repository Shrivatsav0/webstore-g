"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Loader2, Home, RefreshCw } from "lucide-react";

type SortKey = "featured" | "alpha" | "count-desc";

export default function CategoriesPage() {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("featured");

  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...orpc.categories.list.queryOptions(),
    retry: 1, // Only retry once
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const filtered = React.useMemo(() => {
    if (!categories) return [];

    const q = query.trim().toLowerCase();
    let res = categories.filter(
      (c) =>
        q.length === 0 ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.badge?.toLowerCase().includes(q)
    );

    switch (sort) {
      case "alpha":
        res = res.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "count-desc":
        res = res.sort((a, b) => (b.count ?? -1) - (a.count ?? -1));
        break;
      default:
        // featured: keep original order
        break;
    }
    return res;
  }, [categories, query, sort]);

  const handleRetry = () => {
    refetch();
  };

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background text-foreground">
          {/* Decorative top background */}
          <div aria-hidden className="relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/30 to-background" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/15),transparent_60%)] blur-3xl" />
            <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_70%)]">
              <div className="size-full bg-[linear-gradient(to_right,theme(colors.border/40)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/40)_1px,transparent_1px)] bg-[size:36px_36px]" />
            </div>
          </div>

          <section className="container mx-auto px-4 py-10">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-8 rounded-lg border border-destructive/20 bg-destructive/5 p-8 backdrop-blur supports-[backdrop-filter]:bg-destructive/5">
                <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Error Loading Categories
                </h1>
                <p className="mb-6 text-muted-foreground">
                  Failed to load categories. Please try again or return to the
                  home page.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button
                    onClick={handleRetry}
                    variant="default"
                    className="w-full backdrop-blur supports-[backdrop-filter]:bg-primary/90 sm:w-auto"
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
                    className="w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:w-auto"
                  >
                    <Link href="/">
                      <Home className="mr-2 size-4" />
                      Go Home
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground">
        {/* Decorative top background */}
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
                Categories
              </h1>
              <p className="text-muted-foreground">
                Browse ranks, crate keys, cosmetics, and more.
              </p>
            </div>

            {/* Controls */}
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              <div className="relative w-full md:w-80">
                <Input
                  placeholder="Search categories..."
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
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="alpha">Alphabetical</SelectItem>
                  <SelectItem value="count-desc">Most items</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </header>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin" />
            </div>
          )}

          {/* Grid */}
          {!isLoading && (
            <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c, idx) => (
                <li key={c.id}>
                  <Link
                    href={`/categories/${c.id}`}
                    className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Card className="group relative h-80 overflow-hidden border-border/60 bg-card/70 transition-all duration-300 hover:shadow-lg">
                      {/* Background image */}
                      <div className="absolute inset-0">
                        <Image
                          src={c.image}
                          alt={c.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                          priority={idx < 3}
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-background/10" />
                      </div>

                      {/* Floating content */}
                      <div className="absolute inset-x-4 bottom-4 z-10">
                        <div className="rounded-lg border border-border/60 bg-background/60 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
                          <div className="mb-2 flex items-center justify-between">
                            {c.badge ? (
                              <Badge className="bg-secondary/60 text-secondary-foreground backdrop-blur hover:bg-secondary/70">
                                {c.badge}
                              </Badge>
                            ) : (
                              <span />
                            )}
                            {typeof c.count === "number" ? (
                              <span className="text-xs text-muted-foreground">
                                {c.count} items
                              </span>
                            ) : null}
                          </div>
                          <CardTitle className="mb-1 text-xl">
                            {c.title}
                          </CardTitle>
                          <CardContent className="p-0">
                            <p className="text-foreground/80">
                              {c.description}
                            </p>
                          </CardContent>
                        </div>
                      </div>

                      {/* Inner border */}
                      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/60" />
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Footer line showing totals */}
          {!isLoading && (
            <div className="mt-10 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filtered.length} of {categories?.length || 0}{" "}
                categories
              </p>
              <Separator className="hidden flex-1 md:block" />
            </div>
          )}
        </section>
      </main>
    </>
  );
}
