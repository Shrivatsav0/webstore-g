// components/dashboard/headerConfig.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CInput } from "@/components/ui/cinput";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface HeaderConfig {
  logoText: string;
  showLogo: boolean;
}

interface HeaderConfigSectionProps {
  headerConfig: HeaderConfig;
  setHeaderConfig: (config: HeaderConfig) => void;
}

export default function HeaderConfigSection({
  headerConfig,
  setHeaderConfig,
}: HeaderConfigSectionProps) {
  const SectionTip = ({ text }: { text: string }) => (
    <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
      <span>{text}</span>
    </div>
  );

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 rounded-lg bg-primary/10">
            <Globe className="size-6 text-primary" />
          </div>
          Header Configuration
          <Badge variant="secondary" className="ml-auto">
            Global
          </Badge>
        </CardTitle>
        <CardDescription className="text-base">
          Configure your site's header appearance and branding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <CInput
              label="Logo Text"
              value={headerConfig.logoText}
              onChange={(e) =>
                setHeaderConfig({ ...headerConfig, logoText: e.target.value })
              }
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
                checked={headerConfig.showLogo}
                onCheckedChange={(checked) =>
                  setHeaderConfig({ ...headerConfig, showLogo: checked })
                }
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

        <SectionTip text="The header appears on every page of your site. Keep the logo text concise and memorable." />
      </CardContent>
    </Card>
  );
}
