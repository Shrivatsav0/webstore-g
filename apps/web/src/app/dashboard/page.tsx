"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import type { User } from "better-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, AlertTriangle, Users } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { SiteHeader } from "@/components/sidebar/site-header";

export default function Dashboard() {
  const [errorOpen, setErrorOpen] = useState(false);

  // Fetch users (admin check is already done in layout)
  const users = useQuery({
    ...orpc.adminUsers.queryOptions(),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  // Error handling
  const errorMessage = users.error
    ? String(users.error?.message || "An unexpected error occurred")
    : undefined;

  // Auto-open modal when error occurs
  if (errorMessage && !errorOpen) {
    queueMicrotask(() => setErrorOpen(true));
  }

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-6 max-w-9xl">
          {/* Loader state */}
          {users.isLoading ? (
            <Card className="relative overflow-hidden border-border/50">
              <div
                aria-hidden
                className="pointer-events-none abs olute inset-0"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]">
                  <div className="size-full animate-pulse bg-[linear-gradient(to_right,theme(colors.border/30)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/30)_1px,transparent_1px)] bg-[size:36px_36px]" />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="relative z-10">Loading Users</CardTitle>
                <CardDescription className="relative z-10">
                  Fetching the latest user data. Please wait...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative z-10 space-y-3">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Error modal */}
          <Dialog
            open={!!errorMessage && errorOpen}
            onOpenChange={setErrorOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-destructive" />
                  {errorMessage}
                </DialogTitle>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => users.refetch()}
                  className="gap-1"
                >
                  Retry
                  <ArrowRight className="size-4" />
                </Button>
                <Link href="/">
                  <Button onClick={() => setErrorOpen(false)}>Close</Button>
                </Link>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Users list */}
          {!users.isLoading && !users.error ? (
            <section className="mt-8">
              <div className="mb-6 text-center">
                <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                  Users Directory
                </h2>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  A quick overview of your authenticated users
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(users.data as User[] | undefined)?.map((user) => (
                  <Card
                    key={user.id}
                    className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {user.name || "Unnamed User"}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {user.email || "No email provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Separator className="mb-4" />
                      <ul className="space-y-2 text-sm">
                        <li className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            User ID:
                          </span>{" "}
                          {user.id}
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty state */}
              {(!users.data ||
                (Array.isArray(users.data) && users.data.length === 0)) && (
                <Card className="mt-8 border-border/50">
                  <CardHeader>
                    <CardTitle>No users found</CardTitle>
                    <CardDescription>
                      It looks a bit quiet here. Once users sign up, they will
                      appear on this page.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => users.refetch()} className="gap-1">
                      Refresh
                      <ArrowRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>
          ) : null}
        </main>
      </div>
    </>
  );
}
