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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  heroData,
  features,
  categories,
  stats,
  testimonials,
  newsletter,
  footerData,
  siteConfig,
} from "../../../../data/data";

export default function LandingPage() {
  const HeroIcon = heroData.badge.icon;
  const SiteLogo = siteConfig.logo;

  return (
    <div className="h-full bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Animated grid + gradient glow using theme tokens */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/25 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/20),transparent_60%)] blur-3xl" />
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]">
            <div className="size-full bg-[linear-gradient(to_right,theme(colors.border/40)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/40)_1px,transparent_1px)] bg-[size:36px_36px]" />
          </div>
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 backdrop-blur supports-[backdrop-filter]:bg-secondary/60"
            >
              {HeroIcon ? <HeroIcon className="mr-1 size-3" /> : null}
              {heroData.badge.text}
            </Badge>

            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
                {heroData.title}
              </span>
              <span className="block text-muted-foreground">
                {heroData.subtitle}
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              {heroData.description}
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href={heroData.buttons.primaryHref}>
                <Button
                  size="lg"
                  className="px-8 text-lg shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  {heroData.buttons.primary}
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
              <Link href={heroData.buttons.secondaryHref}>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 text-lg backdrop-blur supports-[backdrop-filter]:bg-background/40"
                >
                  {heroData.buttons.secondary}
                </Button>
              </Link>
            </div>

            {/* Hero helper links */}
            {heroData.helperLinks?.length ? (
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                {heroData.helperLinks.map((l: any, i: number) => (
                  <Link
                    key={i}
                    href={l.href}
                    className="underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Shop by Category
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Explore our carefully curated collections
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Card
                key={index}
                className="group relative h-80 cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:shadow-xl"
              >
                {/* Background image with layered overlay */}
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

                {/* Floating content card */}
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
                      {category.cta?.href ? (
                        <Link
                          href={category.cta.href}
                          className="inline-flex items-center text-sm text-foreground/90 underline-offset-4 hover:text-foreground hover:underline"
                        >
                          {category.cta.label ?? "Explore"}
                          <ArrowRight className="ml-1 size-4" />
                        </Link>
                      ) : null}
                    </div>
                    <CardTitle className="mb-1 text-xl">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-foreground/80">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/60" />
              </Card>
            ))}
          </div>
        </div>
      </section>

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

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg focus-within:shadow-lg"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                  </div>
                  <CardHeader>
                    {Icon ? (
                      <Icon className="mx-auto mb-4 size-12 text-foreground transition-transform duration-300 group-hover:scale-110" />
                    ) : null}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="space-y-4">
                  {Icon ? (
                    <Icon className="mx-auto size-12 text-foreground" />
                  ) : null}
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">{stat.number}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Don't just take our word for it
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="relative border-border/50 transition-all duration-300 hover:shadow-lg"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-6 top-6 text-6xl text-primary/20"
                >
                  “
                </span>
                <CardHeader className="pt-14">
                  <div className="mb-4 flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-current text-primary"
                      />
                    ))}
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {`"${testimonial.content}"`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              {newsletter.title}
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              {newsletter.description}
            </p>
            <form
              className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                placeholder={newsletter.placeholder}
                className="flex-1"
                type="email"
                aria-label="Email address"
                required
              />
              <Button type="submit">
                {newsletter.button}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
              {newsletter.disclaimer}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {SiteLogo ? <SiteLogo className="size-6" /> : null}
                <span className="text-xl font-bold">{siteConfig.name}</span>
              </div>
              <p className="text-muted-foreground">{footerData.description}</p>
            </div>
            {footerData.sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-semibold">{section.title}</h3>
                <div className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      href={link.href}
                      className="block text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Separator className="mb-8" />
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-muted-foreground">{footerData.copyright}</p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {footerData.poweredBy}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
