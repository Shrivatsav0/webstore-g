// components/CategoriesSection.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

interface CategoriesSectionProps {
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export function CategoriesSection({
  limit = 3,
  showTitle = true,
  className = "",
}: CategoriesSectionProps) {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    ...orpc.categories.list.queryOptions({
      input: {},
    }),
    retry: 1,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Get the first 'limit' categories
  const displayCategories = categories?.slice(0, limit) || [];

  if (error) {
    return (
      <section className={`py-20 ${className}`}>
        <div className="container mx-auto px-4">
          {showTitle && (
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Shop by Category
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Explore our carefully curated collections
              </p>
            </div>
          )}

          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-muted-foreground">
              Failed to load categories. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        {showTitle && (
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Shop by Category
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Explore our carefully curated collections
            </p>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? // Skeleton loading state
              Array.from({ length: limit }).map((_, index) => (
                <CategorySkeleton key={index} />
              ))
            : // Actual categories
              displayCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
        </div>

        {/* Show "View All Categories" link if we have more categories */}
        {!isLoading && categories && categories.length > limit && (
          <div className="mt-12 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center text-lg font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View All Categories
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// Category Card Component
function CategoryCard({ category, index }: { category: any; index: number }) {
  return (
    <Link href={`/categories/${category.id}`}>
      <Card className="group relative h-80 cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:shadow-xl">
        <div className="absolute inset-0">
          <Image
            src={category.image || "/placeholder.svg"}
            alt={category.title || "Category"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            priority={index < 3}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-background/10" />
        </div>

        <div className="absolute inset-0 flex items-end p-6">
          <div className="w-full rounded-lg border border-border/60 bg-background/60 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/40 transition-colors">
            <div className="mb-2 flex items-center justify-between">
              {category.badge ? (
                <Badge className="bg-secondary/50 text-secondary-foreground backdrop-blur hover:bg-secondary/60">
                  {category.badge}
                </Badge>
              ) : (
                <span />
              )}
              <div className="inline-flex items-center text-sm text-foreground/90 underline-offset-4 hover:text-foreground hover:underline">
                Explore
                <ArrowRight className="ml-1 size-4" />
              </div>
            </div>
            <CardTitle className="mb-1 text-xl">{category.title}</CardTitle>
            <CardDescription className="text-foreground/80">
              {category.description}
            </CardDescription>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/60" />
      </Card>
    </Link>
  );
}

// Category Skeleton Component
function CategorySkeleton() {
  return (
    <Card className="relative h-80 overflow-hidden border-border/50">
      {/* Image skeleton */}
      <div className="absolute inset-0">
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-background/10" />
      </div>

      {/* Content skeleton */}
      <div className="absolute inset-0 flex items-end p-6">
        <div className="w-full rounded-lg border border-border/60 bg-background/60 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
          <div className="mb-2 flex items-center justify-between">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="mb-2 h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-2/3" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/60" />
    </Card>
  );
}
