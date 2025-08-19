// app/dashboard/support/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Users,
  Clock,
  BarChart3,
  Download,
  Upload,
} from "lucide-react";
import { SiteHeader } from "@/components/sidebar/site-header";
import { CInput } from "@/components/ui/cinput";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

// Validation schemas
const supportConfigSchema = z.object({
  heroTitle: z.string().min(1, "Title is required").max(100, "Title too long"),
  heroSubtitle: z
    .string()
    .min(1, "Subtitle is required")
    .max(150, "Subtitle too long"),
  heroDescription: z
    .string()
    .min(10, "Description too short")
    .max(500, "Description too long"),
  contactEmail: z.string().email("Invalid email format"),
  contactPhone: z.string().optional(),
  businessHours: z
    .string()
    .min(1, "Business hours required")
    .max(100, "Too long"),
  responseTime: z.string().min(1, "Response time required").max(50, "Too long"),
});

const faqCategorySchema = z.object({
  title: z.string().min(1, "Title required").max(50, "Title too long"),
  description: z
    .string()
    .min(5, "Description too short")
    .max(200, "Description too long"),
  icon: z.string().min(1, "Icon required"),
  order: z.number().min(1),
  isActive: z.boolean(),
});

const faqSchema = z.object({
  categoryId: z.number().min(1, "Category required"),
  question: z
    .string()
    .min(5, "Question too short")
    .max(200, "Question too long"),
  answer: z.string().min(10, "Answer too short"),
  order: z.number().min(1),
  isActive: z.boolean(),
});

type ValidationError = {
  section: string;
  field: string;
  message: string;
};

// FAQ Analytics Component
const FaqAnalytics = ({
  faqs,
  categories,
}: {
  faqs: any[];
  categories: any[];
}) => {
  const analytics = useMemo(() => {
    const totalFaqs = faqs.length;
    const activeFaqs = faqs.filter((faq) => faq.isActive).length;
    const categoryStats = categories.map((category) => ({
      ...category,
      faqCount: faqs.filter((faq) => faq.categoryId === category.id).length,
      activeFaqCount: faqs.filter(
        (faq) => faq.categoryId === category.id && faq.isActive
      ).length,
    }));

    return {
      totalFaqs,
      activeFaqs,
      inactiveFaqs: totalFaqs - activeFaqs,
      categoryStats,
      mostPopularCategory: categoryStats.reduce(
        (prev, current) => (prev.faqCount > current.faqCount ? prev : current),
        categoryStats[0]
      ),
    };
  }, [faqs, categories]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total FAQs
              </p>
              <p className="text-2xl font-bold">{analytics.totalFaqs}</p>
            </div>
            <MessageCircle className="size-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active FAQs
              </p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.activeFaqs}
              </p>
            </div>
            <CheckCircle2 className="size-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Inactive FAQs
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {analytics.inactiveFaqs}
              </p>
            </div>
            <AlertCircle className="size-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Top Category
              </p>
              <p className="text-lg font-bold truncate">
                {analytics.mostPopularCategory?.title || "None"}
              </p>
              <p className="text-xs text-muted-foreground">
                {analytics.mostPopularCategory?.faqCount || 0} FAQs
              </p>
            </div>
            <Users className="size-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function SupportDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<number | null>(
    null
  );
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);

  const queryClient = useQueryClient();

  // Queries
  const supportConfigQuery = useQuery(orpc.support.config.list.queryOptions());
  const faqCategoriesQuery = useQuery(
    orpc.support.faqCategories.list.queryOptions()
  );
  const faqsQuery = useQuery(orpc.support.faqs.list.queryOptions());

  // Local state for editing
  const [supportConfig, setSupportConfig] = useState({
    heroTitle: "",
    heroSubtitle: "",
    heroDescription: "",
    contactEmail: "",
    contactPhone: "",
    businessHours: "",
    responseTime: "",
  });

  const [faqCategories, setFaqCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  // Track what needs to be saved
  const [pendingCategoryDeletes, setPendingCategoryDeletes] = useState<
    number[]
  >([]);
  const [pendingFaqDeletes, setPendingFaqDeletes] = useState<number[]>([]);

  const filteredFaqsForDashboard = useMemo(() => {
    if (!selectedFaqCategory) return faqs;
    return faqs.filter((faq) => faq.categoryId === selectedFaqCategory);
  }, [faqs, selectedFaqCategory]);

  // Update local state when data loads
  useEffect(() => {
    if (supportConfigQuery.data && supportConfigQuery.data.length > 0) {
      const config = supportConfigQuery.data[0];
      setSupportConfig({
        heroTitle: config.heroTitle ?? "",
        heroSubtitle: config.heroSubtitle ?? "",
        heroDescription: config.heroDescription ?? "",
        contactEmail: config.contactEmail ?? "",
        contactPhone: config.contactPhone ?? "",
        businessHours: config.businessHours ?? "",
        responseTime: config.responseTime ?? "",
      });
    }
  }, [supportConfigQuery.data]);

  useEffect(() => {
    if (faqCategoriesQuery.data) {
      setFaqCategories(faqCategoriesQuery.data);
    }
  }, [faqCategoriesQuery.data]);

  useEffect(() => {
    if (faqsQuery.data) {
      setFaqs(faqsQuery.data);
    }
  }, [faqsQuery.data]);

  // Mutations
  const supportConfigMutation = useMutation(
    orpc.support.config.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.support.config.list.queryKey(),
        });
      },
    })
  );

  const faqCategoryMutation = useMutation(
    orpc.support.faqCategories.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.support.faqCategories.list.queryKey(),
        });
      },
    })
  );

  const faqMutation = useMutation(
    orpc.support.faqs.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.support.faqs.list.queryKey(),
        });
      },
    })
  );

  // Delete mutations
  const deleteFaqCategoryMutation = useMutation(
    orpc.support.faqCategories.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.support.faqCategories.list.queryKey(),
        });
      },
    })
  );

  const deleteFaqMutation = useMutation(
    orpc.support.faqs.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.support.faqs.list.queryKey(),
        });
      },
    })
  );

  const validateAllData = (): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    // Validate support config
    const configResult = supportConfigSchema.safeParse(supportConfig);
    if (!configResult.success) {
      configResult.error.issues.forEach((err) => {
        validationErrors.push({
          section: "Support Configuration",
          field: err.path.join("."),
          message: err.message,
        });
      });
    }

    // Validate FAQ categories
    faqCategories.forEach((category, index) => {
      const categoryResult = faqCategorySchema.safeParse(category);
      if (!categoryResult.success) {
        categoryResult.error.issues.forEach((err) => {
          validationErrors.push({
            section: "FAQ Categories",
            field: `Category ${index + 1} - ${err.path.join(".")}`,
            message: err.message,
          });
        });
      }
    });

    // Validate FAQs
    faqs.forEach((faq, index) => {
      const faqResult = faqSchema.safeParse(faq);
      if (!faqResult.success) {
        faqResult.error.issues.forEach((err) => {
          validationErrors.push({
            section: "FAQs",
            field: `FAQ ${index + 1} - ${err.path.join(".")}`,
            message: err.message,
          });
        });
      }
    });

    return validationErrors;
  };

  const saveChanges = async () => {
    setIsLoading(true);
    setSaveStatus("idle");

    const validationErrors = validateAllData();
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      setIsLoading(false);
      setSaveStatus("error");
      return;
    }

    try {
      // Save support config
      await supportConfigMutation.mutateAsync(supportConfig);

      // Save FAQ categories
      for (const category of faqCategories) {
        if (category.title && category.description) {
          // Only save if has content
          await faqCategoryMutation.mutateAsync({
            id: category.id > 1000000000000 ? undefined : category.id, // If temp ID, don't send it
            title: category.title,
            description: category.description,
            icon: category.icon,
            order: category.order,
            isActive: category.isActive,
          });
        }
      }

      // Hard-delete categories queued for deletion
      for (const categoryId of pendingCategoryDeletes) {
        if (categoryId < 1000000000000) {
          await deleteFaqCategoryMutation.mutateAsync({ id: categoryId });
        }
      }

      // Save FAQs
      for (const faq of faqs) {
        if (faq.question && faq.answer) {
          // Only save if has content
          await faqMutation.mutateAsync({
            id: faq.id > 1000000000000 ? undefined : faq.id, // If temp ID, don't send it
            categoryId: faq.categoryId,
            question: faq.question,
            answer: faq.answer,
            order: faq.order,
            isActive: faq.isActive,
          });
        }
      }

      // Hard-delete FAQs queued for deletion
      for (const faqId of pendingFaqDeletes) {
        if (faqId < 1000000000000) {
          await deleteFaqMutation.mutateAsync({ id: faqId });
        }
      }

      // Clear pending deletes
      setPendingCategoryDeletes([]);
      setPendingFaqDeletes([]);

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error: any) {
      setSaveStatus("error");
      setErrors([
        {
          section: "System",
          field: "save",
          message: error?.message || "Failed to save changes.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // FAQ Category functions
  const addFaqCategory = () => {
    const newCategory = {
      id: Date.now(), // Temporary ID
      title: "",
      description: "",
      icon: "HelpCircle",
      order: faqCategories.length + 1,
      isActive: true,
    };
    setFaqCategories([...faqCategories, newCategory]);
  };

  const updateFaqCategory = (id: number, updates: any) => {
    setFaqCategories(
      faqCategories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const removeFaqCategory = (id: number) => {
    const removed = faqCategories.find((c) => c.id === id);
    // Optimistically update UI
    setFaqCategories(faqCategories.filter((cat) => cat.id !== id));
    setFaqs(faqs.filter((faq) => faq.categoryId !== id));

    // Persist hard delete immediately if it exists in DB
    if (removed && id < 1000000000000) {
      deleteFaqCategoryMutation.mutate({ id });

      // Also hard-delete its FAQs that already exist in DB
      faqs
        .filter((f) => f.categoryId === id && f.id < 1000000000000)
        .forEach((f) => {
          deleteFaqMutation.mutate({ id: f.id });
        });
    }
  };

  // FAQ functions
  const addFaq = () => {
    const newFaq = {
      id: Date.now(), // Temporary ID
      categoryId: faqCategories[0]?.id || 1,
      question: "",
      answer: "",
      order: faqs.length + 1,
      isActive: true,
    };
    setFaqs([...faqs, newFaq]);
    setExpandedFaqs([...expandedFaqs, newFaq.id]);
  };

  const updateFaq = (id: number, updates: any) => {
    setFaqs(faqs.map((faq) => (faq.id === id ? { ...faq, ...updates } : faq)));
  };

  const removeFaq = (id: number) => {
    const existingFaq = faqs.find((f) => f.id === id);
    setFaqs(faqs.filter((faq) => faq.id !== id));
    setExpandedFaqs(expandedFaqs.filter((faqId) => faqId !== id));

    if (existingFaq && id < 1000000000000) {
      deleteFaqMutation.mutate({ id });
    }
  };

  const toggleFaqExpansion = (id: number) => {
    setExpandedFaqs((prev) =>
      prev.includes(id) ? prev.filter((faqId) => faqId !== id) : [...prev, id]
    );
  };

  // Export/Import functions
  const exportFaqs = () => {
    const exportData = {
      faqs: faqs.map((faq: any) => ({
        ...faq,
        categoryTitle: faqCategories.find(
          (cat: any) => cat.id === faq.categoryId
        )?.title,
      })),
      categories: faqCategories,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faqs-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFaqs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        if (importData.faqs && Array.isArray(importData.faqs)) {
          setFaqs([
            ...faqs,
            ...importData.faqs.map((faq: any) => ({
              ...faq,
              id: Date.now() + Math.random(),
            })),
          ]);
        }
      } catch (error) {
        console.error("Failed to import FAQs:", error);
      }
    };
    reader.readAsText(file);
  };

  const ErrorAlert = () => {
    if (errors.length === 0) return null;

    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-2">
            Please fix the following errors:
          </div>
          <ul className="space-y-1 text-sm">
            {errors.map((error, index) => (
              <li key={index}>
                <Badge variant="outline" className="mr-2 text-xs">
                  {error.section}
                </Badge>
                <strong>{error.field}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  const SuccessAlert = () => {
    if (saveStatus !== "success") return null;

    return (
      <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700 dark:text-green-300">
          All changes have been saved successfully!
        </AlertDescription>
      </Alert>
    );
  };

  // Mock analytics data
  const mockAnalytics = {
    totalTickets: 1247,
    avgResponseTime: "2.3h",
    satisfactionRate: 94.2,
    activeCategories: faqCategories.filter((cat) => cat.isActive).length,
  };

  return (
    <>
      <SiteHeader title="Support Dashboard" />
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Support Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your support page content and track performance
            </p>
          </div>

          <ErrorAlert />
          <SuccessAlert />

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {/* <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="size-4" />
                Overview
              </TabsTrigger> */}
              <TabsTrigger value="config" className="flex items-center gap-2">
                <HelpCircle className="size-4" />
                Configuration
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="flex items-center gap-2"
              >
                <Users className="size-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="faqs" className="flex items-center gap-2">
                <MessageCircle className="size-4" />
                FAQs
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            {/* <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Tickets
                        </p>
                        <p className="text-2xl font-bold">
                          {mockAnalytics.totalTickets}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-primary/10">
                        <Mail className="size-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Avg Response Time
                        </p>
                        <p className="text-2xl font-bold">
                          {mockAnalytics.avgResponseTime}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-primary/10">
                        <Clock className="size-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Satisfaction Rate
                        </p>
                        <p className="text-2xl font-bold">
                          {mockAnalytics.satisfactionRate}%
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-primary/10">
                        <Users className="size-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Active Categories
                        </p>
                        <p className="text-2xl font-bold">
                          {mockAnalytics.activeCategories}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-primary/10">
                        <HelpCircle className="size-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent> */}

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <HelpCircle className="size-6 text-primary" />
                    </div>
                    Support Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your support page hero section and contact
                    information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <CInput
                      label="Hero Title"
                      value={supportConfig.heroTitle}
                      onChange={(e) =>
                        setSupportConfig({
                          ...supportConfig,
                          heroTitle: e.target.value,
                        })
                      }
                      placeholder="How can we help?"
                    />
                    <CInput
                      label="Hero Subtitle"
                      value={supportConfig.heroSubtitle}
                      onChange={(e) =>
                        setSupportConfig({
                          ...supportConfig,
                          heroSubtitle: e.target.value,
                        })
                      }
                      placeholder="Get the support you need"
                    />
                  </div>

                  <CInput
                    label="Hero Description"
                    value={supportConfig.heroDescription}
                    onChange={(e) =>
                      setSupportConfig({
                        ...supportConfig,
                        heroDescription: e.target.value,
                      })
                    }
                    textarea
                    placeholder="Find answers to common questions or get in touch with our support team."
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <CInput
                      label="Contact Email"
                      type="email"
                      value={supportConfig.contactEmail}
                      onChange={(e) =>
                        setSupportConfig({
                          ...supportConfig,
                          contactEmail: e.target.value,
                        })
                      }
                      placeholder="support@company.com"
                    />
                    <CInput
                      label="Contact Phone (Optional)"
                      value={supportConfig.contactPhone}
                      onChange={(e) =>
                        setSupportConfig({
                          ...supportConfig,
                          contactPhone: e.target.value,
                        })
                      }
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <CInput
                      label="Business Hours"
                      value={supportConfig.businessHours}
                      onChange={(e) =>
                        setSupportConfig({
                          ...supportConfig,
                          businessHours: e.target.value,
                        })
                      }
                      placeholder="Mon-Fri 9AM-5PM EST"
                    />
                    <CInput
                      label="Response Time"
                      value={supportConfig.responseTime}
                      onChange={(e) =>
                        setSupportConfig({
                          ...supportConfig,
                          responseTime: e.target.value,
                        })
                      }
                      placeholder="< 24 hours"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Users className="size-6 text-primary" />
                        </div>
                        FAQ Categories
                      </CardTitle>
                      <CardDescription>
                        Organize your FAQs into categories
                      </CardDescription>
                    </div>
                    <Button onClick={addFaqCategory}>
                      <Plus className="size-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqCategories.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No categories yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first FAQ category to get started.
                      </p>
                      <Button onClick={addFaqCategory}>
                        <Plus className="size-4 mr-2" />
                        Add Your First Category
                      </Button>
                    </div>
                  ) : (
                    faqCategories.map((category, index) => (
                      <Card key={category.id} className="p-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <CInput
                            label="Title"
                            value={category.title}
                            onChange={(e) =>
                              updateFaqCategory(category.id, {
                                title: e.target.value,
                              })
                            }
                            placeholder="Category title"
                          />
                          <CInput
                            label="Icon"
                            value={category.icon}
                            onChange={(e) =>
                              updateFaqCategory(category.id, {
                                icon: e.target.value,
                              })
                            }
                            placeholder="HelpCircle"
                          />
                          <div className="flex items-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateFaqCategory(category.id, {
                                  isActive: !category.isActive,
                                })
                              }
                            >
                              {category.isActive ? "Active" : "Inactive"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeFaqCategory(category.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4">
                          <CInput
                            label="Description"
                            value={category.description}
                            onChange={(e) =>
                              updateFaqCategory(category.id, {
                                description: e.target.value,
                              })
                            }
                            textarea
                            placeholder="Category description"
                          />
                        </div>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQs Tab */}
            <TabsContent value="faqs" className="space-y-6">
              {/* FAQ Analytics */}
              <FaqAnalytics faqs={faqs} categories={faqCategories} />

              {/* Main FAQ Management Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <MessageCircle className="size-6 text-primary" />
                        </div>
                        Frequently Asked Questions
                        <Badge variant="secondary" className="ml-2">
                          {faqs.filter((faq) => faq.isActive).length} Active
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Manage your FAQ content and organize by categories
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={exportFaqs}>
                        <Download className="size-4 mr-2" />
                        Export
                      </Button>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".json"
                          onChange={importFaqs}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline">
                          <Upload className="size-4 mr-2" />
                          Import
                        </Button>
                      </div>
                      <Button
                        onClick={addFaq}
                        disabled={faqCategories.length === 0}
                      >
                        <Plus className="size-4 mr-2" />
                        Add FAQ
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {faqCategories.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You need to create at least one FAQ category before
                        adding FAQs. Go to the Categories tab to create one.
                      </AlertDescription>
                    </Alert>
                  ) : faqs.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No FAQs yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Start by adding your first frequently asked question.
                      </p>
                      <Button onClick={addFaq}>
                        <Plus className="size-4 mr-2" />
                        Add Your First FAQ
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* FAQ Filter */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1">
                          <label className="text-sm font-medium mb-2 block">
                            Filter by Category
                          </label>
                          <select
                            value={selectedFaqCategory || ""}
                            onChange={(e) =>
                              setSelectedFaqCategory(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            className="w-full px-3 py-2 border border-input bg-background rounded-md"
                          >
                            <option value="">All Categories</option>
                            {faqCategories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {filteredFaqsForDashboard.length} FAQs
                          </Badge>
                        </div>
                      </div>

                      {/* FAQ List */}
                      <div className="space-y-4">
                        {filteredFaqsForDashboard.map((faq, index) => {
                          const category = faqCategories.find(
                            (cat) => cat.id === faq.categoryId
                          );
                          return (
                            <Card key={faq.id} className="p-4">
                              <div className="space-y-4">
                                {/* FAQ Header */}
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {category?.title || "Unknown Category"}
                                      </Badge>
                                      <Badge
                                        variant={
                                          faq.isActive ? "default" : "outline"
                                        }
                                        className="text-xs"
                                      >
                                        {faq.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                    </div>
                                    <h4 className="font-medium text-sm text-muted-foreground">
                                      FAQ #{faq.order}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleFaqExpansion(faq.id)}
                                    >
                                      <Edit className="size-4 mr-1" />
                                      {expandedFaqs.includes(faq.id)
                                        ? "Collapse"
                                        : "Edit"}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeFaq(faq.id)}
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* FAQ Content */}
                                {expandedFaqs.includes(faq.id) ? (
                                  <div className="space-y-4 pt-4 border-t">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">
                                          Category
                                        </label>
                                        <select
                                          value={faq.categoryId}
                                          onChange={(e) =>
                                            updateFaq(faq.id, {
                                              categoryId: parseInt(
                                                e.target.value
                                              ),
                                            })
                                          }
                                          className="w-full px-3 py-2 border border-input bg-background rounded-md"
                                        >
                                          {faqCategories.map((category) => (
                                            <option
                                              key={category.id}
                                              value={category.id}
                                            >
                                              {category.title}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">
                                          Order
                                        </label>
                                        <input
                                          type="number"
                                          value={faq.order}
                                          onChange={(e) =>
                                            updateFaq(faq.id, {
                                              order:
                                                parseInt(e.target.value) || 1,
                                            })
                                          }
                                          className="w-full px-3 py-2 border border-input bg-background rounded-md"
                                          min="1"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium mb-2 block">
                                        Question
                                      </label>
                                      <input
                                        type="text"
                                        value={faq.question}
                                        onChange={(e) =>
                                          updateFaq(faq.id, {
                                            question: e.target.value,
                                          })
                                        }
                                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                                        placeholder="Enter the question..."
                                      />
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium mb-2 block">
                                        Answer
                                      </label>
                                      <textarea
                                        value={faq.answer}
                                        onChange={(e) =>
                                          updateFaq(faq.id, {
                                            answer: e.target.value,
                                          })
                                        }
                                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                                        rows={4}
                                        placeholder="Enter the answer..."
                                      />
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={`active-${faq.id}`}
                                          checked={faq.isActive}
                                          onChange={(e) =>
                                            updateFaq(faq.id, {
                                              isActive: e.target.checked,
                                            })
                                          }
                                          className="rounded"
                                        />
                                        <label
                                          htmlFor={`active-${faq.id}`}
                                          className="text-sm"
                                        >
                                          Active
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <h3 className="font-medium">
                                      {faq.question || "Untitled Question"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {faq.answer ||
                                        "No answer provided yet..."}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Floating Save Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={saveChanges}
              disabled={isLoading}
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow px-6 py-3 text-base font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}
