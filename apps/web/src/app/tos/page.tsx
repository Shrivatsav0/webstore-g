// app/terms/page.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  AlertTriangle,
  CreditCard,
  Users,
  Settings,
  Ban,
  FileX,
  CheckCircle,
} from "lucide-react";
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export default function TermsOfServicePage() {
  const siteConfigQuery = useQuery(
    orpc.siteConfig.list.queryOptions({ context: {} })
  );

  const isFooterLoading = siteConfigQuery.isLoading;

  const termsData = [
    {
      id: "general",
      title: "General Terms",
      icon: Shield,
      content:
        'By purchasing, donating, or otherwise completing a transaction through this webstore (the "Store") or related services, you agree to these Terms of Service in full. These terms apply to all users without exception.',
    },
    {
      id: "affiliation",
      title: "No Affiliation with Mojang",
      icon: AlertTriangle,
      content:
        "This server and its associated webstore are not affiliated with Mojang AB, Microsoft, or any of their subsidiaries or partners. All payments are made directly to the server's owners and not to Mojang/Microsoft.",
    },
    {
      id: "digital-goods",
      title: "Digital Goods and Services",
      icon: CreditCard,
      content:
        "All items, ranks, or other benefits offered through the Store are digital goods or services. Once a purchase has been completed, the product is considered delivered. No physical items will be shipped or provided.",
    },
    {
      id: "no-refund",
      title: "No Refund Policy",
      icon: FileX,
      content:
        "All payments are final and non-refundable. By completing a purchase, you waive any right to request or receive a refund, chargeback, or reversal of the payment. Attempting to open a dispute or chargeback with your payment provider may result in a permanent ban from the server and all associated services.",
    },
    {
      id: "eligibility",
      title: "Eligibility",
      icon: Users,
      content:
        "You must have the permission of a parent or legal guardian to make a purchase if you are under the age of 18. By completing a transaction, you confirm that you are the authorized account holder and/or have permission to use the chosen payment method.",
    },
    {
      id: "changes",
      title: "Changes to Benefits",
      icon: Settings,
      content:
        "The server reserves the right to modify, change, or remove any digital goods, ranks, or benefits offered at any time without prior notice. Purchasing a rank or item does not guarantee permanent access if server policies, features, or updates change.",
    },
    {
      id: "termination",
      title: "Termination of Service",
      icon: Ban,
      content:
        "Violation of server rules may result in the loss of your in-game benefits or access to the server. No refunds will be given under these circumstances.",
    },
    {
      id: "liability",
      title: "Liability",
      icon: AlertTriangle,
      content:
        "The Store and the server owners are not responsible for any losses, damages, or issues that may arise from the use of our services. Purchases are made at your own risk.",
    },
    {
      id: "acceptance",
      title: "Acceptance",
      icon: CheckCircle,
      content:
        "By completing a purchase, you acknowledge that you have read, understood, and agreed to these Terms of Service.",
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-full bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <Badge
                variant="secondary"
                className="mb-6 backdrop-blur supports-[backdrop-filter]:bg-secondary/60"
              >
                <Shield className="mr-1 size-3" />
                Legal Information
              </Badge>

              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
                <span className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Terms of
                </span>
                <span className="block text-muted-foreground">Service</span>
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground">
                Please read these terms carefully before using our services or
                making any purchases.
              </p>
            </div>
          </div>
        </section>

        {/* Terms Content Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  Our Terms & Conditions
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  By using our services, you agree to the following terms and
                  conditions
                </p>
              </div>

              <div className="space-y-8">
                {termsData.map((term, index) => {
                  const Icon = term.icon;
                  return (
                    <Card
                      key={term.id}
                      className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-0">
                              Section {index + 1}
                            </div>
                            <CardTitle className="text-xl">
                              {term.title}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{term.content}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Important Notice */}
              <Card className="mt-12 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    <CardTitle className="text-amber-800 dark:text-amber-200">
                      Important Notice
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-700 dark:text-amber-300">
                    These terms are effective immediately and apply to all
                    transactions. We strongly recommend reading and
                    understanding all sections before making any purchases. If
                    you have questions, please contact our support team.
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
