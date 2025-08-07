"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc"; // adjust path
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
// If you don't have Dialog set up, you can temporarily replace with a basic modal:
// const Dialog = ({ open, children }: any) =>
//   open ? (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//       <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
//         {children}
//       </div>
//     </div>
//   ) : null;
// const DialogContent = ({ children }: any) => <>{children}</>;
// const DialogHeader = ({ children }: any) => (
//   <div className="mb-4">{children}</div>
// );
// const DialogTitle = ({ children }: any) => (
//   <h3 className="text-lg font-semibold">{children}</h3>
// );
// const DialogDescription = ({ children }: any) => (
//   <p className="text-sm text-muted-foreground">{children}</p>
// );
// const DialogFooter = ({ children }: any) => (
//   <div className="mt-4 flex justify-end gap-2">{children}</div>
// );

export default function Dashboard() {
  const users = useQuery({
    ...orpc.adminUsers.queryOptions(),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const [errorOpen, setErrorOpen] = useState<boolean>(false);

  // Open modal if error occurs
  const errorMessage = users.error ? (users.error as Error).message : undefined;

  // Keep the modal in sync with error state
  // If there is an error and modal isn't open, open it
  if (errorMessage && !errorOpen) {
    // avoid setting state during render with microtask
    queueMicrotask(() => setErrorOpen(true));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Decorative background similar to landing hero */}
      <section className="relative overflow-hidden py-10">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/25 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/20),transparent_60%)] blur-3xl" />
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]">
            <div className="size-full bg-[linear-gradient(to_right,theme(colors.border/40)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/40)_1px,transparent_1px)] bg-[size:36px_36px]" />
          </div>
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 backdrop-blur supports-[backdrop-filter]:bg-secondary/60"
            >
              <Users className="mr-1 size-3" />
              Admin
            </Badge>

            <h1 className="mb-2 text-4xl font-bold leading-tight md:text-5xl">
              <span className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Manage your users and monitor activity
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-20">
        {/* Loader state */}
        {users.isLoading ? (
          <Card className="relative overflow-hidden border-border/50">
            <div aria-hidden className="pointer-events-none absolute inset-0">
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
        <Dialog open={!!errorMessage && errorOpen} onOpenChange={setErrorOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-destructive" />
                Something went wrong
              </DialogTitle>
              <DialogDescription>
                {errorMessage ??
                  "An unexpected error occurred. Please try again."}
              </DialogDescription>
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
              <Button onClick={() => setErrorOpen(false)}>Close</Button>
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
            {(!users.data || users.data.length === 0) && (
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
  );
}
