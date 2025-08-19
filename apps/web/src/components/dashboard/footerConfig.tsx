// components/dashboard/footerConfig.tsx
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
import { Footprints } from "lucide-react";

interface FooterConfig {
  description: string;
  copyright: string;
  poweredBy: string;
}

interface FooterConfigSectionProps {
  footerConfig: FooterConfig;
  setFooterConfig: (config: FooterConfig) => void;
  headerName?: string;
}

export default function FooterConfigSection({
  footerConfig,
  setFooterConfig,
  headerName,
}: FooterConfigSectionProps) {
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
            <Footprints className="size-6 text-primary" />
          </div>
          Footer Configuration
          <Badge variant="secondary" className="ml-auto">
            Global
          </Badge>
        </CardTitle>
        <CardDescription className="text-base">
          Configure your site's footer content and legal information. The footer
          name comes from the header configuration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {headerName && (
            <div className="p-3 rounded-lg bg-muted/50 border border-muted">
              <p className="text-sm text-muted-foreground">
                <strong>Footer Name:</strong> {headerName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This is controlled by the header configuration
              </p>
            </div>
          )}
          <div className="space-y-1">
            <CInput
              label="Footer Description"
              value={footerConfig.description}
              onChange={(e) =>
                setFooterConfig({
                  ...footerConfig,
                  description: e.target.value,
                })
              }
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
                value={footerConfig.copyright}
                onChange={(e) =>
                  setFooterConfig({
                    ...footerConfig,
                    copyright: e.target.value,
                  })
                }
                placeholder="© 2025 Your Company Name"
              />
              <p className="text-xs text-muted-foreground">Copyright notice</p>
            </div>

            <div className="space-y-1">
              <CInput
                label="Powered By"
                value={footerConfig.poweredBy}
                onChange={(e) =>
                  setFooterConfig({
                    ...footerConfig,
                    poweredBy: e.target.value,
                  })
                }
                placeholder="Powered by Your Platform"
              />
              <p className="text-xs text-muted-foreground">
                Attribution or powered by text
              </p>
            </div>
          </div>
        </div>

        <SectionTip text="The footer appears on every page. Include important legal information and company details." />
      </CardContent>
    </Card>
  );
}
