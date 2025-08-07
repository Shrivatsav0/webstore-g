"use client";

import type { ReactNode } from "react";

// If you need theme providers or QueryClientProvider scoped to dashboard,
// import and wrap here. Keeping minimal as requested.

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Decorative background similar to landing, but no global header */}
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/25 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/20),transparent_60%)] blur-3xl" />
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]">
            <div className="size-full bg-[linear-gradient(to_right,theme(colors.border/40)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/40)_1px,transparent_1px)] bg-[size:36px_36px]" />
          </div>
        </div>

        {/* Content region */}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
