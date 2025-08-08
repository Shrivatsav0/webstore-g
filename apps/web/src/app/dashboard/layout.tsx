"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

// If you need theme providers or QueryClientProvider scoped to dashboard,
// import and wrap here. Keeping minimal as requested.

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const adminCheck = useQuery({
    ...orpc.checkAdminStatus.queryOptions(),
    staleTime: 1000 * 60, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (adminCheck.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verifying Access</CardTitle>
            <CardDescription>
              Checking your admin permissions...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if not admin
  if (adminCheck.data?.isAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have admin permissions to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <div className="relative">
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <AppSidebar variant="inset" />
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </div>
  );
}
