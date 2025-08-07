"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoryItems as rawCategories,
  type CategoryItem,
} from "../../../../../data/data";
import { Header } from "@/components/header";

type SortKey = "featured" | "alpha" | "count-desc";

const normalizeCategories = (raw: CategoryItem[]): CategoryItem[] =>
  raw.map((c) => ({
    id: c.id ?? crypto.randomUUID(),
    title: c.title ?? "Untitled",
    description: c.description ?? "",
    image: c.image ?? "/placeholder.svg",
    badge: c.badge,
    href: c.href ?? "#",
    count: typeof c.count === "number" ? c.count : undefined,
  }));

export default function CategoriesPage() {
  const CATS = React.useMemo(() => normalizeCategories(rawCategories), []);
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("featured");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let res = CATS.filter(
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
  }, [CATS, query, sort]);

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

          {/* Grid */}
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, idx) => (
              <li key={c.id}>
                <Link
                  href={c.href || "#"}
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
                          <p className="text-foreground/80">{c.description}</p>
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

          {/* Footer line showing totals */}
          <div className="mt-10 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length} of {CATS.length} categories
            </p>
            <Separator className="hidden flex-1 md:block" />
          </div>
        </section>
      </main>
    </>
  );
}
