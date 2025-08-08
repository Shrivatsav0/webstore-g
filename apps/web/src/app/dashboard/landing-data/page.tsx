"use client";

import { useState, useMemo } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  Globe,
  LayoutDashboard,
  Star,
  ShoppingBag,
  Mail,
  Footprints,
  Lightbulb,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Calendar,
  ExternalLink,
  Edit,
  Settings,
  Activity,
  Target,
  Zap,
  Clock,
} from "lucide-react";
import {
  siteConfig as initialSite,
  heroData as initialHero,
  features as initialFeatures,
  categories as initialCategories,
  newsletter as initialNewsletter,
  footerData as initialFooter,
  categoryItems as allCategories,
  type CategoryWithCTA,
} from "../../../../../../data/data";
import { SiteHeader } from "@/components/sidebar/site-header";
import { CInput } from "@/components/ui/cinput";

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalVisitors: 12847,
    conversionRate: 3.2,
    bounceRate: 42.1,
    avgSessionDuration: "2m 34s",
    pageViews: 28394,
    uniqueVisitors: 9821,
  },
  sections: {
    hero: {
      views: 12847,
      clicks: 892,
      ctr: 6.9,
      completionRate: 78.3,
    },
    features: {
      views: 8934,
      engagement: 65.2,
      mostViewed: "Fast Delivery",
      avgTimeSpent: "45s",
    },
    categories: {
      views: 7234,
      clicks: 1456,
      ctr: 20.1,
      topCategory: "Electronics",
    },
    newsletter: {
      views: 5678,
      signups: 234,
      conversionRate: 4.1,
      growth: "+12.3%",
    },
  },
  recentActivity: [
    { action: "Hero section updated", time: "2 hours ago", user: "Admin" },
    { action: "New category added", time: "1 day ago", user: "Editor" },
    { action: "Newsletter content changed", time: "2 days ago", user: "Admin" },
    { action: "Site config updated", time: "3 days ago", user: "Admin" },
  ],
};

// Validation schemas (same as before)
const siteConfigSchema = z.object({
  name: z.string().min(1, "Site name is required").max(100, "Too long"),
  url: z.string().url("Invalid URL format"),
  description: z
    .string()
    .min(10, "Description too short")
    .max(500, "Description too long"),
});

const heroSchema = z.object({
  badge: z.object({
    text: z.string().min(1, "Badge text required").max(50, "Badge too long"),
  }),
  title: z.string().min(1, "Title required").max(100, "Title too long"),
  subtitle: z
    .string()
    .min(1, "Subtitle required")
    .max(150, "Subtitle too long"),
  description: z
    .string()
    .min(10, "Description too short")
    .max(300, "Description too long"),
});

const featureSchema = z.object({
  title: z.string().min(1, "Feature title required").max(80, "Title too long"),
  description: z
    .string()
    .min(10, "Description too short")
    .max(200, "Description too long"),
});

const categorySchema = z.object({
  title: z.string().min(1, "Category title required").max(50, "Title too long"),
  description: z
    .string()
    .min(5, "Description too short")
    .max(150, "Description too long"),
  image: z.string().url("Invalid image URL"),
});

const newsletterSchema = z.object({
  title: z
    .string()
    .min(1, "Newsletter title required")
    .max(80, "Title too long"),
  description: z
    .string()
    .min(10, "Description too short")
    .max(200, "Description too long"),
});

const footerSchema = z.object({
  description: z
    .string()
    .min(10, "Description too short")
    .max(300, "Description too long"),
});

type ValidationError = {
  section: string;
  field: string;
  message: string;
};

export default function LandingPageDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [siteConfig, setSiteConfig] = useState(initialSite);
  const [heroData, setHeroData] = useState(initialHero);
  const [features, setFeatures] = useState(initialFeatures);
  const [categories, setCategories] = useState<CategoryWithCTA[]>([]);
  const [newsletter, setNewsletter] = useState(initialNewsletter);
  const [footerData, setFooterData] = useState(initialFooter);

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  // Calculate completion percentage
  const completionStats = useMemo(() => {
    let totalFields = 0;
    let completedFields = 0;

    const checkField = (value: any) => {
      totalFields++;
      if (value && value.toString().trim() !== "") completedFields++;
    };

    // Site Config
    checkField(siteConfig.name);
    checkField(siteConfig.url);
    checkField(siteConfig.description);

    // Hero
    checkField(heroData.badge.text);
    checkField(heroData.title);
    checkField(heroData.subtitle);
    checkField(heroData.description);

    // Features
    features.forEach((feature) => {
      checkField(feature.title);
      checkField(feature.description);
    });

    // Categories (max 3 but at least 1)
    categories.forEach((category) => {
      checkField(category.title);
      checkField(category.description);
      checkField(category.image);
    });

    // Newsletter
    checkField(newsletter.title);
    checkField(newsletter.description);

    // Footer
    checkField(footerData.description);

    return Math.round((completedFields / totalFields) * 100);
  }, [siteConfig, heroData, features, categories, newsletter, footerData]);

  const validateAllData = (): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    // Validation logic (same as before)
    const siteResult = siteConfigSchema.safeParse(siteConfig);
    if (!siteResult.success) {
      siteResult.error.issues.forEach((err) => {
        validationErrors.push({
          section: "Site Configuration",
          field: err.path.join("."),
          message: err.message,
        });
      });
    }

    const heroResult = heroSchema.safeParse(heroData);
    if (!heroResult.success) {
      heroResult.error.issues.forEach((err) => {
        validationErrors.push({
          section: "Hero Section",
          field: err.path.join("."),
          message: err.message,
        });
      });
    }

    features.forEach((feature, index) => {
      const featureResult = featureSchema.safeParse(feature);
      if (!featureResult.success) {
        featureResult.error.issues.forEach((err) => {
          validationErrors.push({
            section: "Features",
            field: `Feature ${index + 1} - ${err.path.join(".")}`,
            message: err.message,
          });
        });
      }
    });

    categories.forEach((category, index) => {
      const categoryResult = categorySchema.safeParse(category);
      if (!categoryResult.success) {
        categoryResult.error.issues.forEach((err) => {
          validationErrors.push({
            section: "Categories",
            field: `Category ${index + 1} - ${err.path.join(".")}`,
            message: err.message,
          });
        });
      }
    });

    const newsletterResult = newsletterSchema.safeParse(newsletter);
    if (!newsletterResult.success) {
      newsletterResult.error.issues.forEach((err) => {
        validationErrors.push({
          section: "Newsletter",
          field: err.path.join("."),
          message: err.message,
        });
      });
    }

    const footerResult = footerSchema.safeParse(footerData);
    if (!footerResult.success) {
      footerResult.error.issues.forEach((err) => {
        validationErrors.push({
          section: "Footer",
          field: err.path.join("."),
          message: err.message,
        });
      });
    }

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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Saving data...", {
        siteConfig,
        heroData,
        features,
        categories,
        newsletter,
        footerData,
      });

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      setErrors([
        {
          section: "System",
          field: "save",
          message: "Failed to save changes. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend = "up",
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: any;
    trend?: "up" | "down" | "neutral";
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p
                className={`text-sm flex items-center gap-1 ${
                  trend === "up"
                    ? "text-green-600"
                    : trend === "down"
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                <TrendingUp className="size-3" />
                {change}
              </p>
            )}
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="size-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    action,
    badge,
  }: {
    title: string;
    description: string;
    icon: any;
    action: () => void;
    badge?: string;
  }) => (
    <Card
      className="hover:shadow-md transition-all hover:border-primary/20 cursor-pointer group"
      onClick={action}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{title}</h3>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );

  const SectionTip = ({ text }: { text: string }) => (
    <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
      <Lightbulb className="mt-0.5 size-4 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );

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

  return (
    <>
      <SiteHeader title="Landing Page Dashboard" />
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6 max-w-9xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Landing Page Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your landing page content and track performance
            </p>
          </div>

          <ErrorAlert />
          <SuccessAlert />

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="site" className="flex items-center gap-2">
                <Globe className="size-4" />
                Site Config
              </TabsTrigger>
              <TabsTrigger value="hero" className="flex items-center gap-2">
                <LayoutDashboard className="size-4" />
                Hero
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Star className="size-4" />
                Features
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="flex items-center gap-2"
              >
                <ShoppingBag className="size-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="other" className="flex items-center gap-2">
                <Settings className="size-4" />
                Other
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              {/* Completion Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="size-5 text-primary" />
                    Setup Progress
                  </CardTitle>
                  <CardDescription>
                    Complete your landing page setup
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Overall Completion
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {completionStats}%
                      </span>
                    </div>
                    <Progress value={completionStats} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {completionStats === 100
                        ? "🎉 All sections completed!"
                        : completionStats >= 80
                        ? "Almost there! Just a few more fields to go."
                        : "Keep going! Fill out more sections to improve your landing page."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Visitors"
                  value={mockAnalytics.overview.totalVisitors.toLocaleString()}
                  change="+12.5%"
                  icon={Users}
                />
                <StatCard
                  title="Page Views"
                  value={mockAnalytics.overview.pageViews.toLocaleString()}
                  change="+8.3%"
                  icon={Eye}
                />
                <StatCard
                  title="Conversion Rate"
                  value={`${mockAnalytics.overview.conversionRate}%`}
                  change="+0.8%"
                  icon={Target}
                />
                <StatCard
                  title="Avg. Session"
                  value={mockAnalytics.overview.avgSessionDuration}
                  change="+15s"
                  icon={Clock}
                />
              </div>

              {/* Section Performance */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="size-5 text-primary" />
                      Section Performance
                    </CardTitle>
                    <CardDescription>
                      How each section is performing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Hero Section
                        </span>
                        <Badge variant="secondary">
                          {mockAnalytics.sections.hero.ctr}% CTR
                        </Badge>
                      </div>
                      <Progress
                        value={mockAnalytics.sections.hero.completionRate}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Features</span>
                        <Badge variant="secondary">
                          {mockAnalytics.sections.features.engagement}%
                          Engagement
                        </Badge>
                      </div>
                      <Progress
                        value={mockAnalytics.sections.features.engagement}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Categories</span>
                        <Badge variant="secondary">
                          {mockAnalytics.sections.categories.ctr}% CTR
                        </Badge>
                      </div>
                      <Progress
                        value={mockAnalytics.sections.categories.ctr * 4}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Newsletter</span>
                        <Badge variant="secondary">
                          {mockAnalytics.sections.newsletter.conversionRate}%
                          Conversion
                        </Badge>
                      </div>
                      <Progress
                        value={
                          mockAnalytics.sections.newsletter.conversionRate * 20
                        }
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="size-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest changes and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAnalytics.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="p-1 rounded-full bg-primary/10 mt-1">
                            <div className="size-2 rounded-full bg-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {activity.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.time} • by {activity.user}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="size-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <QuickActionCard
                      title="Edit Hero Section"
                      description="Update your main banner content"
                      icon={Edit}
                      action={() => setActiveTab("hero")}
                      badge="High Impact"
                    />
                    <QuickActionCard
                      title="Manage Categories"
                      description="Add or edit product categories"
                      icon={ShoppingBag}
                      action={() => setActiveTab("categories")}
                    />
                    <QuickActionCard
                      title="Update Features"
                      description="Highlight your key features"
                      icon={Star}
                      action={() => setActiveTab("features")}
                    />
                    <QuickActionCard
                      title="Site Configuration"
                      description="Global site settings"
                      icon={Settings}
                      action={() => setActiveTab("site")}
                    />
                    <QuickActionCard
                      title="Newsletter Setup"
                      description="Configure email signup"
                      icon={Mail}
                      action={() => setActiveTab("other")}
                    />
                    <QuickActionCard
                      title="Preview Site"
                      description="See how your site looks"
                      icon={Eye}
                      action={() => window.open("/", "_blank")}
                      badge="External"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SITE CONFIG TAB */}
            <TabsContent value="site" className="space-y-6">
              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Globe className="size-6 text-primary" />
                    </div>
                    Site Configuration
                  </CardTitle>
                  <CardDescription className="text-base">
                    Global site settings that appear across your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <CInput
                      label="Site Name"
                      value={siteConfig.name}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, name: e.target.value })
                      }
                      placeholder="Enter your site name"
                    />
                    <CInput
                      label="Website URL"
                      value={siteConfig.url}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, url: e.target.value })
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                  <CInput
                    label="Site Description"
                    value={siteConfig.description}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        description: e.target.value,
                      })
                    }
                    textarea
                    placeholder="Brief description of your website"
                  />
                  <SectionTip text="This information appears in your header, footer, and search engine results." />
                </CardContent>
              </Card>
            </TabsContent>

            {/* HERO TAB */}
            <TabsContent value="hero" className="space-y-6">
              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <LayoutDashboard className="size-6 text-primary" />
                    </div>
                    Hero Section
                    <Badge variant="secondary" className="ml-auto">
                      {mockAnalytics.sections.hero.ctr}% CTR
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-base">
                    The main banner that visitors see first
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <StatCard
                      title="Views"
                      value={mockAnalytics.sections.hero.views.toLocaleString()}
                      icon={Eye}
                    />
                    <StatCard
                      title="Clicks"
                      value={mockAnalytics.sections.hero.clicks.toLocaleString()}
                      icon={MousePointer}
                    />
                    <StatCard
                      title="Completion Rate"
                      value={`${mockAnalytics.sections.hero.completionRate}%`}
                      icon={Target}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <CInput
                      label="Badge Text"
                      value={heroData.badge.text}
                      onChange={(e) =>
                        setHeroData({
                          ...heroData,
                          badge: { ...heroData.badge, text: e.target.value },
                        })
                      }
                      placeholder="New Feature"
                    />
                    <CInput
                      label="Hero Title"
                      value={heroData.title}
                      onChange={(e) =>
                        setHeroData({ ...heroData, title: e.target.value })
                      }
                      placeholder="Your Amazing Product"
                    />
                  </div>
                  <CInput
                    label="Hero Subtitle"
                    value={heroData.subtitle}
                    onChange={(e) =>
                      setHeroData({ ...heroData, subtitle: e.target.value })
                    }
                    placeholder="Catchy subtitle that explains your value"
                  />
                  <CInput
                    label="Hero Description"
                    value={heroData.description}
                    onChange={(e) =>
                      setHeroData({ ...heroData, description: e.target.value })
                    }
                    textarea
                    placeholder="Detailed description of what you offer"
                  />
                  <SectionTip text="Keep your hero content concise and compelling. Focus on your main value proposition." />
                </CardContent>
              </Card>
            </TabsContent>

            {/* FEATURES TAB */}
            <TabsContent value="features" className="space-y-6">
              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Star className="size-6 text-primary" />
                    </div>
                    Features
                    <Badge variant="secondary" className="ml-auto">
                      {mockAnalytics.sections.features.engagement}% Engagement
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Highlight what makes your product special
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <StatCard
                      title="Section Views"
                      value={mockAnalytics.sections.features.views.toLocaleString()}
                      icon={Eye}
                    />
                    <StatCard
                      title="Avg. Time Spent"
                      value={mockAnalytics.sections.features.avgTimeSpent}
                      icon={Clock}
                    />
                    <StatCard
                      title="Most Viewed"
                      value={mockAnalytics.sections.features.mostViewed}
                      icon={Star}
                    />
                  </div>

                  {features.map((feature, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border bg-card/50 space-y-4"
                    >
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Feature {i + 1}
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <CInput
                          label="Title"
                          value={feature.title}
                          onChange={(e) => {
                            const updated = [...features];
                            updated[i].title = e.target.value;
                            setFeatures(updated);
                          }}
                          placeholder="Feature name"
                        />
                        <CInput
                          label="Description"
                          value={feature.description}
                          onChange={(e) => {
                            const updated = [...features];
                            updated[i].description = e.target.value;
                            setFeatures(updated);
                          }}
                          textarea
                          placeholder="Explain this feature's benefit"
                        />
                      </div>
                    </div>
                  ))}
                  <SectionTip text="Focus on benefits rather than just features. How does each feature help your customers?" />
                </CardContent>
              </Card>
            </TabsContent>

            {/* CATEGORIES TAB */}
            <TabsContent value="categories" className="space-y-6">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ShoppingBag className="size-6 text-primary" />
                    </div>
                    Categories
                    <Badge variant="secondary" className="ml-auto">
                      {categories.length} / 3 Selected
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Select up to 3 categories for your landing page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    {allCategories.map((cat) => {
                      const isSelected = categories.some(
                        (c) => c.id === cat.id
                      );
                      const isDisabled = !isSelected && categories.length >= 3;

                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            if (isSelected) {
                              setCategories(
                                categories.filter((c) => c.id !== cat.id)
                              );
                            } else if (!isDisabled) {
                              setCategories([...categories, cat]);
                            }
                          }}
                          className={`cursor-pointer rounded-lg border p-4 flex flex-col items-center text-center transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-primary/50"
                          } ${
                            isDisabled ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <img
                            src={cat.image}
                            alt={cat.title}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                          <h4 className="font-medium">{cat.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {cat.description}
                          </p>
                          {isSelected && (
                            <Badge className="mt-2" variant="default">
                              Selected
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <SectionTip text="Choose the categories that best represent your offerings. You can select up to 3." />
                </CardContent>
              </Card>
            </TabsContent>

            {/* OTHER TAB */}
            <TabsContent value="other" className="space-y-6">
              {/* Newsletter Section */}
              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="size-6 text-primary" />
                    </div>
                    Newsletter
                    <Badge variant="secondary" className="ml-auto">
                      {mockAnalytics.sections.newsletter.conversionRate}%
                      Conversion
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Encourage visitors to subscribe to your newsletter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <StatCard
                      title="Views"
                      value={mockAnalytics.sections.newsletter.views.toLocaleString()}
                      icon={Eye}
                    />
                    <StatCard
                      title="Signups"
                      value={mockAnalytics.sections.newsletter.signups.toLocaleString()}
                      icon={Users}
                    />
                    <StatCard
                      title="Growth"
                      value={mockAnalytics.sections.newsletter.growth}
                      icon={TrendingUp}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <CInput
                      label="Newsletter Title"
                      value={newsletter.title}
                      onChange={(e) =>
                        setNewsletter({ ...newsletter, title: e.target.value })
                      }
                      placeholder="Stay Updated"
                    />
                    <CInput
                      label="Newsletter Description"
                      value={newsletter.description}
                      onChange={(e) =>
                        setNewsletter({
                          ...newsletter,
                          description: e.target.value,
                        })
                      }
                      textarea
                      placeholder="Why should people subscribe?"
                    />
                  </div>
                  <SectionTip text="Offer value in your newsletter signup. What will subscribers get that others won't?" />
                </CardContent>
              </Card>

              {/* Footer Section */}
              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Footprints className="size-6 text-primary" />
                    </div>
                    Footer
                  </CardTitle>
                  <CardDescription className="text-base">
                    Footer content and company information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CInput
                    label="Footer Description"
                    value={footerData.description}
                    onChange={(e) =>
                      setFooterData({
                        ...footerData,
                        description: e.target.value,
                      })
                    }
                    textarea
                    placeholder="Brief company description or mission statement"
                  />
                  <SectionTip text="Include your brand message and key information visitors might need." />
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
