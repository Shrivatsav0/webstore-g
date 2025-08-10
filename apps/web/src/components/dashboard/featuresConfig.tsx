"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CInput } from "@/components/ui/cinput";

type Feature = {
  id: number;
  title: string;
  description: string;
};

interface FeaturesConfigSectionProps {
  featuresConfig: Feature[];
  setFeaturesConfig: (features: Feature[]) => void;
}

export default function FeaturesConfigSection({
  featuresConfig,
  setFeaturesConfig,
}: FeaturesConfigSectionProps) {
  const handleFeatureChange = (
    index: number,
    field: keyof Feature,
    value: string
  ) => {
    const updated = [...featuresConfig];
    updated[index] = { ...updated[index], [field]: value };
    setFeaturesConfig(updated);
  };

  return (
    <Card className="border-2 hover:border-primary/20 transition-colors">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          Features
        </CardTitle>
        <CardDescription className="text-base">
          Highlight what makes your product special
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {featuresConfig.map((feature, i) => (
          <div key={i} className="p-4 rounded-lg border bg-card/50 space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              Feature {i + 1}
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <CInput
                label="Title"
                value={feature.title}
                onChange={(e) =>
                  handleFeatureChange(i, "title", e.target.value)
                }
                placeholder="Feature name"
              />
              <CInput
                label="Description"
                value={feature.description}
                onChange={(e) =>
                  handleFeatureChange(i, "description", e.target.value)
                }
                textarea
                placeholder="Explain this feature's benefit"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
