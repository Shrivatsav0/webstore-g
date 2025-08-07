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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, CheckCircle2, AlertTriangle, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { siteConfig, footerData, supportData } from "../../../../../data/data";
import { Header } from "@/components/header";

type StatusState = "operational" | "degraded" | "outage" | "maintenance";

export default function SupportPage() {
  const HeroIcon = supportData.hero.badge.icon;
  const SiteLogo = siteConfig.logo;

  const status = supportData.status as {
    state: StatusState;
    message: string;
    lastUpdatedISO: string;
  };
  const statusStyles: Record<
    StatusState,
    { icon: React.ComponentType<any>; className: string; message: string }
  > = {
    operational: {
      icon: CheckCircle2,
      className:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      message: "All systems operational. Instant delivery is online.",
    },
    degraded: {
      icon: AlertTriangle,
      className:
        "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
      message: "Service is experiencing degraded performance.",
    },
    outage: {
      icon: AlertTriangle,
      className:
        "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30",
      message: "We’re investigating an outage affecting some services.",
    },
    maintenance: {
      icon: Wrench,
      className:
        "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
      message: "Scheduled maintenance is in progress.",
    },
  };

  const state = supportData.status.state as StatusState;
  const StatusIcon = statusStyles[state].icon;
  const statusClass = statusStyles[state].className;
  const bannerMessage =
    supportData.status.message?.trim() || statusStyles[state].message;

  const onTicketSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire to your API route or 3rd-party form endpoint
    // For now, noop + console
    console.log("Ticket submitted (mock)");
  };

  return (
    <>
      <Header />
      <div className="h-full bg-background text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 lg:py-32">
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
                {supportData.hero.badge.text}
              </Badge>

              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
                <span className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {supportData.hero.title}
                </span>
                <span className="block text-muted-foreground">
                  {supportData.hero.subtitle}
                </span>
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground">
                {supportData.hero.description}
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href={supportData.hero.buttons.primaryHref}>
                  <Button
                    size="lg"
                    className="px-8 text-lg shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    {supportData.hero.buttons.primary}
                    <ArrowRight className="ml-2 size-5" />
                  </Button>
                </Link>
                <Link href={supportData.hero.buttons.secondaryHref}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 text-lg backdrop-blur supports-[backdrop-filter]:bg-background/40"
                  >
                    {supportData.hero.buttons.secondary}
                  </Button>
                </Link>
              </div>

              {supportData.hero.helperLinks?.length ? (
                <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  {supportData.hero.helperLinks.map((l, i) => (
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

        {/* Status banner */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${statusClass}`}
            >
              <div className="flex items-center gap-3">
                <StatusIcon className="size-5" />
                <p className="font-medium">{bannerMessage}</p>
              </div>
              <span className="text-sm opacity-80">
                Last updated:{" "}
                {new Date(supportData.status.lastUpdatedISO).toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                A quick overview of buying and delivery
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {supportData.howItWorks.map((step, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                  </div>
                  <CardHeader>
                    <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full border border-border/60 bg-background">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <CardTitle className="text-center text-xl">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Payments and Refunds */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 grid gap-8 lg:grid-cols-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Secure and widely supported options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supportData.paymentMethods.map((m, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border/60 bg-background/60 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/40"
                    >
                      <div className="font-medium">{m.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {m.detail}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Refunds</CardTitle>
                  <CardDescription>Key points at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/90">
                    {supportData.refunds.summary}
                  </p>
                  <Link href={supportData.refunds.ctaHref}>
                    <Button variant="outline">
                      {supportData.refunds.ctaLabel}
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faq" className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">FAQ</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Answers to common questions
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {supportData.faqs.map((f, i) => (
                <Card
                  key={i}
                  className="border-border/50 transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{f.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {f.a}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact / Ticket */}
        <section id="contact" className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <div className="mb-10 text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  {supportData.contact.ticket.title}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {supportData.contact.ticket.description}
                </p>
              </div>

              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <form className="grid gap-4" onSubmit={onTicketSubmit}>
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input
                        required
                        name="name"
                        placeholder="Your name"
                        aria-label="Your name"
                      />
                      <Input
                        required
                        name="email"
                        type="email"
                        placeholder="Email address"
                        aria-label="Email address"
                      />
                    </div>
                    <Input
                      required
                      name="username"
                      placeholder="Minecraft username"
                      aria-label="Minecraft username"
                    />
                    <Input
                      required
                      name="orderId"
                      placeholder="Order ID (e.g., BS-12345)"
                      aria-label="Order ID"
                    />
                    <Textarea
                      required
                      name="message"
                      placeholder="Describe the issue"
                      aria-label="Describe the issue"
                      className="min-h-[120px]"
                    />
                    <div className="flex items-center gap-3">
                      <Button type="submit">
                        Submit Ticket
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Average response time: under 24 hours
                      </span>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {supportData.contact.channels.map((c, i) => (
                  <Link key={i} href={c.href}>
                    <div className="rounded-lg border border-border/60 bg-background/60 p-4 transition-colors hover:bg-background">
                      <div className="font-medium">{c.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {c.note}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer (matches landing) */}
        <footer className="border-t border-border/40 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {SiteLogo ? <SiteLogo className="size-6" /> : null}
                  <span className="text-xl font-bold">{siteConfig.name}</span>
                </div>
                <p className="text-muted-foreground">
                  {siteConfig.description}
                </p>
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
    </>
  );
}
