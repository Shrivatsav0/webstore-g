"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CInput } from "@/components/ui/cinput";
import { LayoutDashboard } from "lucide-react";

export default function HeroConfigSection({
  heroConfig,
  setHeroConfig,
  error,
}: {
  heroConfig: {
    badgeText: string;
    title: string;
    subtitle: string;
    description: string;
  };
  setHeroConfig: (data: {
    badgeText: string;
    title: string;
    subtitle: string;
    description: string;
  }) => void;
  error?: string | null;
}) {
  // Form handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setHeroConfig({ ...heroConfig, [e.target.name]: e.target.value });
  };

  return (
    <Card className="border-2 hover:border-primary/20 transition-colors">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 rounded-lg bg-primary/10">
            <LayoutDashboard className="size-6 text-primary" />
          </div>
          Hero Section
          <Badge variant="secondary" className="ml-auto">
            Main Banner
          </Badge>
        </CardTitle>
        <CardDescription className="text-base">
          The main banner that visitors see first
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <CInput
          label="Badge Text"
          name="badgeText"
          value={heroConfig.badgeText}
          onChange={handleChange}
          placeholder="New Feature"
          required
        />
        <CInput
          label="Hero Title"
          name="title"
          value={heroConfig.title}
          onChange={handleChange}
          placeholder="Your Amazing Product"
          required
        />
        <CInput
          label="Hero Subtitle"
          name="subtitle"
          value={heroConfig.subtitle}
          onChange={handleChange}
          placeholder="Catchy subtitle that explains your value"
          required
        />
        <CInput
          label="Hero Description"
          name="description"
          value={heroConfig.description}
          onChange={handleChange}
          textarea
          placeholder="Detailed description of what you offer"
          required
        />
      </CardContent>
    </Card>
  );
}
