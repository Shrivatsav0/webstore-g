// app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ArrowRight, Sparkles, Zap, Shield, Truck } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { CategoriesSection } from "@/components/landing/category-section";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useEffect, useState } from "react";

export default function LandingPage() {


  const heroQuery = useQuery(
    orpc.heroConfig.list.queryOptions({ context: {} })
  );
  const featuresQuery = useQuery(
    orpc.featuresConfig.list.queryOptions({ context: {} })
  );
  const siteConfigQuery = useQuery(
    orpc.siteConfig.list.queryOptions({ context: {} })
  );
  const isLoading = heroQuery.isLoading || featuresQuery.isLoading;
  const isFooterLoading = siteConfigQuery.isLoading;
  const error = heroQuery.error || featuresQuery.error || siteConfigQuery.error;

  const [heroConfig, setHeroConfig] = useState({
    badgeText: "",
    title: "",
    subtitle: "",
    description: "",
  });

  useEffect(() => {
    if (heroQuery.data && heroQuery.data.length > 0) {
      setHeroConfig({
        badgeText: heroQuery.data[0]?.badgeText ?? "",
        title: heroQuery.data[0]?.title ?? "",
        subtitle: heroQuery.data[0]?.subtitle ?? "",
        description: heroQuery.data[0]?.description ?? "",
      });
    }
  }, [heroQuery.data]);

  const featureIcons = [Star, Zap, Shield, Truck];

  return (
    <>
      <Header />
      <div className="h-full bg-background text-foreground ">
        {error ? (
          <div className="flex h-screen items-center justify-center text-red-500">
            Failed to load content
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32">
              <div className="container relative mx-auto px-4">
                <div className="mx-auto max-w-4xl text-center">
                  {isLoading ? (
                    <>
                      <Skeleton className="mx-auto mb-6 h-6 w-32 rounded-full" />
                      <Skeleton className="mx-auto mb-4 h-10 w-3/4" />
                      <Skeleton className="mx-auto mb-4 h-8 w-1/2" />
                      <Skeleton className="mx-auto mb-6 h-5 w-2/3" />
                      <div className="flex justify-center gap-4">
                        <Skeleton className="h-12 w-32 rounded-md" />
                        <Skeleton className="h-12 w-32 rounded-md" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Badge
                        variant="secondary"
                        className="mb-6 backdrop-blur supports-[backdrop-filter]:bg-secondary/60"
                      >
                        <Sparkles className="mr-1 size-3" />
                        {heroConfig.badgeText}
                      </Badge>

                      <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
                        <span className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
                          {heroConfig.title}
                        </span>
                        <span className="block text-muted-foreground">
                          {heroConfig.subtitle}
                        </span>
                      </h1>

                      <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground">
                        {heroConfig.description}
                      </p>

                      <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href="/categories">
                          <Button
                            size="lg"
                            className="px-8 text-lg shadow-sm transition-all duration-300 hover:shadow-md"
                          >
                            Browse Shop
                            <ArrowRight className="ml-2 size-5" />
                          </Button>
                        </Link>
                        <Link href="/support">
                          <Button
                            variant="outline"
                            size="lg"
                            className="px-8 text-lg backdrop-blur supports-[backdrop-filter]:bg-background/40"
                          >
                            Support
                          </Button>
                        </Link>
                      </div>


                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Product Categories - Now using the separate component */}
            <CategoriesSection limit={3} showTitle={true} />

            {/* Features Section */}
            <section className="py-20">
              <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                  <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                    Why Choose Us
                  </h2>
                  <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                    We're committed to providing exceptional service and quality
                    products
                  </p>
                </div>

                {isLoading ? (
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="p-6">
                        <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
                        <Skeleton className="mx-auto mb-2 h-6 w-3/4" />
                        <Skeleton className="mx-auto h-4 w-5/6" />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {featuresQuery.data?.map((feature: any, index: number) => {
                      const Icon = featureIcons[index % featureIcons.length];
                      return (
                        <Card
                          key={feature.id || index}
                          className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg focus-within:shadow-lg"
                        >
                          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                          </div>
                          <CardHeader>
                            {Icon ? (
                              <Icon className="mx-auto mb-4 size-12 text-foreground transition-transform duration-300 group-hover:scale-110" />
                            ) : null}
                            <CardTitle className="text-xl text-center">
                              {feature.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-base text-center">
                              {feature.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/40 py-16">
              <div className="container mx-auto px-4">
                <div className="mb-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">

                      <span className="text-xl font-bold">
                        {siteConfigQuery.data?.[0]?.headerLogoText}
                      </span>
                    </div>
                    {isFooterLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        {siteConfigQuery.data?.[0]?.footerDescription }
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="mb-8" />

                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                  {isFooterLoading ? (
                    <>
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground">
                        {siteConfigQuery.data?.[0]?.footerCopyright }
                      </p>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                          {siteConfigQuery.data?.[0]?.footerPoweredBy }
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </footer>
          </>
        )}
      </div>
    </>
  );
}
