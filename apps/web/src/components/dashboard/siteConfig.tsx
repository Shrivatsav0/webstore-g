"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CInput } from "@/components/ui/cinput";

export default function SiteConfigSection({
  siteConfig,
  setSiteConfig,
  error,
}: {
  siteConfig: { name: string; url: string; description: string };
  setSiteConfig: (data: {
    name: string;
    url: string;
    description: string;
  }) => void;
  error?: string | null;
}) {
  // Form handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSiteConfig({ ...siteConfig, [e.target.name]: e.target.value });
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
      <CardContent className="space-y-4">
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
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
      </CardContent>
    </Card>
  );
}
