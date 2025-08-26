"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CInput } from "@/components/ui/cinput";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe, Footprints } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

export default function SiteConfigSection({
  siteConfig,
  setSiteConfig,
  error,
}: {
  siteConfig: {
    name: string;
    url: string;
    description: string;
    headerLogoText: string;
    headerLogoImage?: string;
    headerShowLogo: boolean;
    footerDescription: string;
    footerCopyright: string;
    footerPoweredBy: string;
  };
  setSiteConfig: React.Dispatch<
    React.SetStateAction<{
      name: string;
      url: string;
      description: string;
      headerLogoText: string;
      headerLogoImage?: string;
      headerShowLogo: boolean;
      footerDescription: string;
      footerCopyright: string;
      footerPoweredBy: string;
    }>
  >;
  error?: string | null;
}) {
  // Form handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSiteConfig({ ...siteConfig, [e.target.name]: e.target.value });
  };

  const handleHeaderLogoChange = (checked: boolean) => {
    setSiteConfig({ ...siteConfig, headerShowLogo: checked });
  };

  return (
    <Card className="border-2 hover:border-primary/20 transition-colors">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          Site Configuration
        </CardTitle>
        <CardDescription className="text-base">
          Global site settings that appear across your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

        {/* Basic Site Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Basic Site Settings</h3>
          </div>
          <CInput
            label="Site Name"
            name="name"
            value={siteConfig.name}
            onChange={handleChange}
            placeholder="Enter your site name"
            required
          />
          <CInput
            label="Website URL"
            name="url"
            value={siteConfig.url}
            onChange={handleChange}
            placeholder="https://example.com"
            required
          />
          <CInput
            label="Site Description"
            name="description"
            value={siteConfig.description}
            onChange={handleChange}
            textarea
            placeholder="Brief description of your website"
            required
          />
        </div>

        {/* Header Configuration */}
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Header Configuration</h3>
            <Badge variant="secondary">Global</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <CInput
                label="Logo Text"
                name="headerLogoText"
                value={siteConfig.headerLogoText}
                onChange={handleChange}
                placeholder="Your Site Name"
              />
              <p className="text-xs text-muted-foreground">
                The text that appears next to your logo
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="show-logo">Show Logo</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-logo"
                  checked={siteConfig.headerShowLogo}
                  onCheckedChange={handleHeaderLogoChange}
                />
                <Label
                  htmlFor="show-logo"
                  className="text-sm text-muted-foreground"
                >
                  Display logo icon in header
                </Label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo Image</Label>
            <ImageUpload
              value={siteConfig.headerLogoImage}
              onChange={(url) => setSiteConfig({ ...siteConfig, headerLogoImage: url })}
              onRemove={() => setSiteConfig({ ...siteConfig, headerLogoImage: undefined })}
              folder="site-logos"
            />
            <p className="text-xs text-muted-foreground">
              Upload a custom logo image. If not provided, the default icon will be used.
            </p>
          </div>
        </div>

        {/* Footer Configuration */}
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center gap-2 mb-4">
            <Footprints className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Footer Configuration</h3>
            <Badge variant="secondary">Global</Badge>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <CInput
                label="Footer Description"
                name="footerDescription"
                value={siteConfig.footerDescription}
                onChange={handleChange}
                textarea
                placeholder="Brief description about your company or website"
              />
              <p className="text-xs text-muted-foreground">
                A short description that appears in the footer
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <CInput
                  label="Copyright Text"
                  name="footerCopyright"
                  value={siteConfig.footerCopyright}
                  onChange={handleChange}
                  placeholder="© 2025 Your Company Name"
                />
                <p className="text-xs text-muted-foreground">
                  Copyright notice
                </p>
              </div>
              <div className="space-y-1">
                <CInput
                  label="Powered By"
                  name="footerPoweredBy"
                  value={siteConfig.footerPoweredBy}
                  onChange={handleChange}
                  placeholder="Powered by Your Platform"
                />
                <p className="text-xs text-muted-foreground">
                  Attribution or powered by text
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
