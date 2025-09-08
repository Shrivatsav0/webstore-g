// app/privacy/page.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Database,
  Users,
  Cookie,
  Share2,
  Clock,
  UserCheck,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export default function PrivacyPolicyPage() {
  const siteConfigQuery = useQuery(
    orpc.siteConfig.list.queryOptions({ context: {} })
  );

  const isFooterLoading = siteConfigQuery.isLoading;

  // Check if this is your specific webstore (you can modify this condition)
  const isYourWebstore = process.env.NEXT_PUBLIC_DISCORD_INVITE_LINK; // Or any other way to identify your store
  const discordInviteLink = process.env.NEXT_PUBLIC_DISCORD_INVITE_LINK || "#";

  const privacyData = [
    {
      id: "introduction",
      title: "Introduction",
      icon: Shield,
      content:
        'This Privacy Policy explains how we collect, use, and protect your personal data when you make purchases through our Minecraft server webstore (the "Store"). By using the Store, you agree to the terms of this Privacy Policy.',
    },
    {
      id: "data-collection",
      title: "Data We Collect",
      icon: Database,
      content:
        "When you make a purchase, we may collect the following information:",
      details: [
        "Minecraft username and UUID – used to deliver your purchased goods and to verify ownership.",
        "Email address and payment information – collected and processed securely by our payment provider, LemonSqueezy. We do not store your payment details on our servers.",
        "IP address – automatically collected for fraud prevention and order verification.",
      ],
    },
    {
      id: "data-usage",
      title: "How We Use Your Data",
      icon: Users,
      content: "We use the collected data for the following purposes:",
      details: [
        "To process and deliver your order (e.g. applying ranks or items in-game).",
        "To verify ownership of purchases and prevent fraud.",
        "To handle disputes or chargebacks (your Minecraft UUID may be logged for this purpose).",
        "To provide customer support through our Discord server.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      icon: Cookie,
      content:
        "Our Store only uses essential cookies required for the website to function (such as storing your shopping cart and session information). We do not use tracking or marketing cookies that require additional consent.",
    },
    {
      id: "data-sharing",
      title: "Data Sharing",
      icon: Share2,
      content: "We are committed to protecting your privacy:",
      details: [
        "Your payment details are handled exclusively by LemonSqueezy.",
        "We do not sell, trade, or share your personal data with third parties, except when required by law or to resolve payment disputes.",
      ],
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: Clock,
      content: "We retain your data responsibly:",
      details: [
        "Your Minecraft UUID may be stored to verify past purchases and to handle chargebacks.",
        "Other data will be retained only as long as necessary for order processing, fraud prevention, or to comply with legal obligations.",
      ],
    },
    {
      id: "your-rights",
      title: "Your Rights",
      icon: UserCheck,
      content: "Depending on your location, you may have the right to:",
      details: [
        "Request a copy of the data we store about you.",
        "Request correction or deletion of your personal data.",
        "Withdraw consent to data processing where applicable.",
        "If you would like to exercise any of these rights, please contact us.",
      ],
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <Badge
                variant="secondary"
                className="mb-6 backdrop-blur supports-[backdrop-filter]:bg-secondary/60"
              >
                <Shield className="mr-1 size-3" />
                Privacy & Data Protection
              </Badge>

              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
                <span className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Privacy
                </span>
                <span className="block text-muted-foreground">Policy</span>
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground">
                Learn how we collect, use, and protect your personal information
                when you use our services.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Content Section */}
        <section className="bg-background py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  Your Privacy Matters
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  We are committed to protecting your privacy and handling your
                  data responsibly
                </p>
              </div>

              <div className="space-y-8">
                {privacyData.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <Card
                      key={section.id}
                      className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                      </div>
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Section {index + 1}
                            </div>
                            <CardTitle className="text-xl">
                              {section.title}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-base leading-relaxed text-muted-foreground mb-4">
                          {section.content}
                        </p>
                        {section.details && (
                          <ul className="space-y-3">
                            {section.details.map((detail, detailIndex) => (
                              <li
                                key={detailIndex}
                                className="flex items-start gap-3"
                              >
                                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span className="text-sm text-muted-foreground leading-relaxed">
                                  {detail}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Contact Section */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Section 8
                        </div>
                        <CardTitle className="text-xl">Contact</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base leading-relaxed text-muted-foreground mb-6">
                      If you have any questions about this Privacy Policy or how
                      your data is handled, you can reach us{" "}
                      {isYourWebstore
                        ? "via our Discord server."
                        : "via our Discord server."}
                    </p>

                    {isYourWebstore && (
                      <Link
                        href={discordInviteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Join Our Discord
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Data Protection Notice */}
              <Card className="mt-12 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <CardTitle className="text-green-800 dark:text-green-200">
                      Data Protection Commitment
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 dark:text-green-300">
                    We are committed to protecting your privacy and complying
                    with applicable data protection laws. Your data is processed
                    securely and only for the purposes outlined in this policy.
                    We never sell your personal information to third parties.
                  </p>
                </CardContent>
              </Card>

              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Last updated:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t border-border/40 py-16">
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
                    {siteConfigQuery.data?.[0]?.footerDescription}
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
                    {siteConfigQuery.data?.[0]?.footerCopyright}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                      {siteConfigQuery.data?.[0]?.footerPoweredBy}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
