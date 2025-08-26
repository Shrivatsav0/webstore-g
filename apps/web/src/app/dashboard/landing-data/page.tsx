"use client";

import { useState, useMemo, useEffect } from "react";
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
import { SiteHeader } from "@/components/sidebar/site-header";
import { CInput } from "@/components/ui/cinput";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import SiteConfigSection from "@/components/dashboard/siteConfig";
import HeroConfigSection from "@/components/dashboard/heroConfig";
import { title } from "process";
import FeaturesConfigSection from "@/components/dashboard/featuresConfig";

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
  },
  recentActivity: [
    { action: "Hero section updated", time: "2 hours ago", user: "Admin" },
    { action: "New category added", time: "1 day ago", user: "Editor" },
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
  headerLogoText: z.string().min(1, "Logo text required").max(50, "Too long"),
  headerShowLogo: z.boolean(),
  footerDescription: z.string().min(10, "Description too short").max(300),
  footerCopyright: z.string().min(1, "Copyright required").max(100),
  footerPoweredBy: z.string().min(1, "Powered by required").max(50),
});

const heroSchema = z.object({
  badgeText: z.string().min(1, "Badge text required").max(20, "Badge too long"),
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
  id: z.number(),
  title: z.string().min(1, "Feature title required").max(80, "Title too long"),
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
  const [features, setFeatures] = useState([]);

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  /* ---------ORPC PROCEDURES--------- */

  const queryClient = useQueryClient();

  /* SITE CONFIG*/
  const {
    data: siteConfigData,
    isLoading: isConfigLoading,
    error: configError,
  } = useQuery(orpc.siteConfig.list.queryOptions());

  // Local state for editing
  const [siteConfig, setSiteConfig] = useState({
    name: "",
    url: "",
    description: "",
    headerLogoText: "",
    headerLogoImage: "",
    headerShowLogo: true,
    footerDescription: "",
    footerCopyright: "",
    footerPoweredBy: "",
  });

  // When DB data loads, update local state
  useEffect(() => {
    if (siteConfigData && siteConfigData.length > 0) {
      setSiteConfig({
        name: siteConfigData[0].name ?? "",
        url: siteConfigData[0].url ?? "",
        description: siteConfigData[0].description ?? "",
        headerLogoText: siteConfigData[0].headerLogoText ?? "",
        headerLogoImage: siteConfigData[0].headerLogoImage ?? "",
        headerShowLogo: siteConfigData[0].headerShowLogo ?? true,
        footerDescription: siteConfigData[0].footerDescription ?? "",
        footerCopyright: siteConfigData[0].footerCopyright ?? "",
        footerPoweredBy: siteConfigData[0].footerPoweredBy ?? "",
      });
    }
  }, [siteConfigData]);

  // Upsert mutation for saving
  const siteConfigMutation = useMutation(
    orpc.siteConfig.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.siteConfig.list.queryKey(),
        });
      },
    })
  );

  /* HERO CONFIG */
  const {
    data: heroConfigData,
    isLoading: isHeroConfigLoading,
    error: heroConfigError,
  } = useQuery(orpc.heroConfig.list.queryOptions());

  const [heroConfig, setHeroConfig] = useState({
    badgeText: "",
    title: "",
    subtitle: "",
    description: "",
  });

  useEffect(() => {
    if (heroConfigData && heroConfigData.length > 0) {
      setHeroConfig({
        badgeText: heroConfigData[0].badgeText ?? "",
        title: heroConfigData[0].title ?? "",
        subtitle: heroConfigData[0].subtitle ?? "",
        description: heroConfigData[0].description ?? "",
      });
    }
  }, [heroConfigData]);

  const heroConfigMutation = useMutation(
    orpc.heroConfig.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.heroConfig.list.queryKey(),
        });
      },
    })
  );

  /* FEATURES SECTION */
  const {
    data: featuresConfigData,
    isLoading: isFeaturesConfigLoading,
    error: featuresConfigError,
  } = useQuery(orpc.featuresConfig.list.queryOptions());

  type Feature = {
    id: number;
    title: string;
    description: string;
  };

  const [featuresConfig, setFeaturesConfig] = useState<Feature[]>([
    { id: 1, title: "", description: "" },
    { id: 2, title: "", description: "" },
    { id: 3, title: "", description: "" },
    { id: 4, title: "", description: "" },
  ]);

  useEffect(() => {
    if (featuresConfigData && featuresConfigData.length > 0) {
      setFeaturesConfig(
        featuresConfigData.map((f: any) => ({
          id: f.id ?? "",
          title: f.title ?? "",
          description: f.description ?? "",
        }))
      );
    }
  }, [featuresConfigData]);

  const featuresConfigMutation = useMutation(
    orpc.featuresConfig.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.featuresConfig.list.queryKey(),
        });
      },
    })
  );

  const [headerConfig, setHeaderConfig] = useState({
    logoText: "",
    showLogo: true,
  });

  const [footerConfig, setFooterConfig] = useState({
    description: "",
    copyright: "",
    poweredBy: "",
  });

  // header/footer now part of siteConfig

  // Add these useEffects:
  useEffect(() => {
    if (siteConfigData && siteConfigData.length > 0) {
      setHeaderConfig({
        logoText: siteConfigData[0].headerLogoText ?? "",
        showLogo: siteConfigData[0].headerShowLogo ?? true,
      });
      setFooterConfig({
        description: siteConfigData[0].footerDescription ?? "",
        copyright: siteConfigData[0].footerCopyright ?? "",
        poweredBy: siteConfigData[0].footerPoweredBy ?? "",
      });
    }
  }, [siteConfigData]);

  // Add these mutations:
  // header/footer merged -> saving through siteConfig only

  const completionStats = useMemo(() => {
    let totalFields = 0;
    let completedFields = 0;

    const checkField = (value: any) => {
      totalFields++;
      if (value && value.toString().trim() !== "") completedFields++;
    };

    // Site Config (including header/footer)
    checkField(siteConfig.name);
    checkField(siteConfig.url);
    checkField(siteConfig.description);
    checkField(siteConfig.headerLogoText);
    checkField(siteConfig.footerDescription);
    checkField(siteConfig.footerCopyright);
    checkField(siteConfig.footerPoweredBy);

    // Hero
    checkField(heroConfig.badgeText);
    checkField(heroConfig.title);
    checkField(heroConfig.subtitle);
    checkField(heroConfig.description);

    // Features
    featuresConfig.forEach((feature) => {
      checkField(feature.title);
      checkField(feature.description);
    });

    return Math.round((completedFields / totalFields) * 100);
  }, [siteConfig, heroConfigData, features]);

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

    const heroResult = heroSchema.safeParse(heroConfig);
    if (!heroResult.success) {
      heroResult.error.issues.forEach((err) => {
        validationErrors.push({
          section: "Hero Section",
          field: err.path.join("."),
          message: err.message,
        });
      });
    }

    featuresConfig.forEach((feature, index) => {
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
        heroConfigData,
        features,
        newsletter,
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

    // SITE CONFIG (now includes header/footer fields)

    try {
      await siteConfigMutation.mutateAsync(siteConfig);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error: any) {
      setSaveStatus("error");
      setErrors(error?.message || "Failed to save changes.");
    }

    // HERO CONFIG
    try {
      await heroConfigMutation.mutateAsync(heroConfig);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error: any) {
      setSaveStatus("error");
      setErrors(error?.message || "Failed to save changes.");
    }

    // features config
    try {
      await featuresConfigMutation.mutateAsync(featuresConfig);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error: any) {
      setSaveStatus("error");
      setErrors(error?.message || "Failed to save changes.");
      console.log("Saving features:", featuresConfig);
      console.log("error message = ", error?.message);
    }

    // header/footer saved through siteConfig now
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
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {/* <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="size-4" />
                Overview
              </TabsTrigger> */}
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
              {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              </div> */}

              {/* Section Performance */}
              {/* <div className="grid gap-6 lg:grid-cols-2">
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
              </div> */}

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
              <SiteConfigSection
                siteConfig={siteConfig}
                setSiteConfig={setSiteConfig}
              />
            </TabsContent>

            {/* HERO TAB */}
            <TabsContent value="hero" className="space-y-6">
              <HeroConfigSection
                heroConfig={heroConfig}
                setHeroConfig={setHeroConfig}
              />
            </TabsContent>

            {/* FEATURES TAB */}
            <TabsContent value="features" className="space-y-6">
              <FeaturesConfigSection
                featuresConfig={featuresConfig}
                setFeaturesConfig={setFeaturesConfig}
              />
            </TabsContent>

            {/* OTHER TAB */}
            <TabsContent value="other" className="space-y-6">
              {/* Additional configurations can be added here in the future */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Settings</CardTitle>
                  <CardDescription>
                    Future configuration options will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This section is reserved for additional site configuration options.
                  </p>
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
