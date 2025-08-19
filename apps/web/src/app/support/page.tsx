// app/support/page.tsx
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Mail,
  Phone,
  Clock,
  MessageCircle,
  Search,
  Send,
  CheckCircle,
  ArrowRight,
  Headphones,
  FileText,
  Users,
  Zap,
} from "lucide-react";
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useState, useMemo } from "react";

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Queries
  const supportConfigQuery = useQuery(
    orpc.support.config.list.queryOptions({ context: {} })
  );
  const faqCategoriesQuery = useQuery(
    orpc.support.faqCategories.list.queryOptions({ context: {} })
  );
  const faqsQuery = useQuery(
    orpc.support.faqs.list.queryOptions({ context: {} })
  );
  const contactMethodsQuery = useQuery(
    orpc.support.contactMethods.list.queryOptions({ context: {} })
  );

  const isLoading =
    supportConfigQuery.isLoading ||
    faqCategoriesQuery.isLoading ||
    faqsQuery.isLoading ||
    contactMethodsQuery.isLoading;

  const error =
    supportConfigQuery.error ||
    faqCategoriesQuery.error ||
    faqsQuery.error ||
    contactMethodsQuery.error;

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    if (!faqsQuery.data) return [];

    let filtered = faqsQuery.data.filter((faq: any) => faq.isActive);

    if (selectedCategory) {
      filtered = filtered.filter(
        (faq: any) => faq.categoryId === selectedCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (faq: any) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [faqsQuery.data, searchQuery, selectedCategory]);

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      HelpCircle,
      Mail,
      Phone,
      MessageCircle,
      Headphones,
      FileText,
      Users,
      Zap,
    };
    return icons[iconName] || HelpCircle;
  };

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Failed to load support content
      </div>
    );
  }

  const supportConfig = supportConfigQuery.data?.[0];
  const categories =
    faqCategoriesQuery.data?.filter((cat: any) => cat.isActive) || [];
  const contactMethods =
    contactMethodsQuery.data?.filter((method: any) => method.isActive) || [];

  return (
    <>
      <Header />
      <div className=" bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              {isLoading ? (
                <>
                  <Skeleton className="mx-auto mb-4 h-10 w-3/4" />
                  <Skeleton className="mx-auto mb-4 h-8 w-1/2" />
                  <Skeleton className="mx-auto mb-8 h-5 w-2/3" />
                </>
              ) : (
                <>
                  <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
                    <span className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {supportConfig?.heroTitle || "How can we help?"}
                    </span>
                  </h1>
                  <h2 className="mb-4 text-xl text-muted-foreground md:text-2xl">
                    {supportConfig?.heroSubtitle || "Get the support you need"}
                  </h2>
                  <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                    {supportConfig?.heroDescription ||
                      "Find answers to common questions or get in touch with our support team."}
                  </p>
                </>
              )}

              {/* Search Bar */}
              {/* <div className="mx-auto mb-8 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search for answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 text-lg"
                  />
                </div>
              </div> */}
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 border-y border-border/40">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {supportConfig?.responseTime || "< 24h"}
                </div>
                <p className="text-muted-foreground">Average Response Time</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {categories.length}
                </div>
                <p className="text-muted-foreground">Help Categories</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {supportConfig?.businessHours || "24/7"}
                </div>
                <p className="text-muted-foreground">Support Hours</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Browse by Category
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Find answers organized by topic
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
                    <Skeleton className="mx-auto mb-2 h-6 w-3/4" />
                    <Skeleton className="mx-auto h-4 w-5/6" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category: any) => {
                  const IconComponent = getIconComponent(category.icon);
                  const categoryFaqCount =
                    faqsQuery.data?.filter(
                      (faq: any) =>
                        faq.categoryId === category.id && faq.isActive
                    ).length || 0;

                  return (
                    <Card
                      key={category.id}
                      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedCategory === category.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/20"
                      }`}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === category.id ? null : category.id
                        )
                      }
                    >
                      <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-xl">
                          {category.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {category.description}
                        </CardDescription>
                        <Badge variant="secondary" className="mx-auto w-fit">
                          {categoryFaqCount} articles
                        </Badge>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Frequently Asked Questions
              </h2>
              {selectedCategory && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-muted-foreground">
                    Showing questions for:
                  </span>
                  <Badge variant="outline">
                    {
                      categories.find((cat: any) => cat.id === selectedCategory)
                        ?.title
                    }
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Clear filter
                  </Button>
                </div>
              )}
            </div>

            <div className="mx-auto max-w-4xl">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="p-6">
                      <Skeleton className="mb-2 h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </Card>
                  ))}
                </div>
              ) : filteredFaqs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFaqs.map((faq: any, index: number) => (
                    <AccordionItem
                      key={faq.id}
                      value={`item-${index}`}
                      className="rounded-lg border bg-background px-6 shadow-sm"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        <div className="prose prose-sm max-w-none">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Card className="p-12 text-center">
                  <HelpCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold">
                    No results found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or browse our categories above.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        {/* <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb- text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Still Need Help?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Get in touch with our support team
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
                    <Skeleton className="mx-auto mb-2 h-6 w-3/4" />
                    <Skeleton className="mx-auto mb-4 h-4 w-5/6" />
                    <Skeleton className="mx-auto h-10 w-32" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contactMethods.map((method: any) => {
                  const IconComponent = getIconComponent(method.icon);
                  return (
                    <Card
                      key={method.id}
                      className="group transition-all duration-300 hover:shadow-lg hover:border-primary/20"
                    >
                      <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-xl">
                          {method.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {method.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="mb-4 font-medium text-foreground">
                          {method.contactInfo}
                        </div>
                        <Button className="w-full">
                          Contact Us
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section> */}

        {/* Contact Form */}
        {/* <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Can't find what you're looking for? Send us a message and
                    we'll get back to you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Describe your question or issue..."
                      rows={5}
                    />
                  </div>
                  <Button className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section> */}
      </div>
    </>
  );
}
