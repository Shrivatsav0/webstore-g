import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Book } from "lucide-react";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div className="inline-flex items-center gap-2">
        <Book className="h-5 w-5 text-primary" />
        <span className="font-semibold">Mc-webstore</span>
      </div>
    ),
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [],
};
