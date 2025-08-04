"use client";

import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, Lock } from "lucide-react";
// Optional: if you have siteConfig/logo similar to landing page
// import { siteConfig } from "@/data/data";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign in successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground">
      {/* Background layers mimicking LandingPage hero */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/25 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/20),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]">
          <div className="size-full bg-[linear-gradient(to_right,theme(colors.border/40)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/40)_1px,transparent_1px)] bg-[size:36px_36px]" />
        </div>
      </div>

      <div className="relative w-full max-w-md px-4">
        {/* Top badge similar to landing page */}
        <div className="mb-6 flex justify-center">
          <Badge className="backdrop-blur supports-[backdrop-filter]:bg-secondary/60">
            Welcome back
          </Badge>
        </div>

        <Card className="relative overflow-hidden border-border/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Subtle corner gradient like features cards */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
          </div>

          <CardHeader className="text-center">
            {/* Optional site logo/name to match footer/hero */}
            {/* <div className="mb-2 flex items-center justify-center space-x-2">
              {siteConfig?.logo ? <siteConfig.logo className="size-6" /> : null}
              <span className="text-xl font-bold">{siteConfig?.name}</span>
            </div> */}
            <CardTitle className="text-2xl md:text-3xl">Sign in</CardTitle>
            <p className="mt-2 text-muted-foreground">
              Access your dashboard and manage your account
            </p>
          </CardHeader>

          <CardContent>
            <Separator className="mb-6" />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-5"
            >
              <div>
                <form.Field name="email">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id={field.name}
                          name={field.name}
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="pl-9"
                          placeholder="you@example.com"
                          autoComplete="email"
                          aria-label="Email address"
                          required
                        />
                      </div>
                      {field.state.meta.errors.map((error) => (
                        <p
                          key={error?.message}
                          className="text-sm text-red-500"
                        >
                          {error?.message}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>
              </div>

              <div>
                <form.Field name="password">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="pl-9"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          aria-label="Password"
                          required
                        />
                      </div>
                      {field.state.meta.errors.map((error) => (
                        <p
                          key={error?.message}
                          className="text-sm text-red-500"
                        >
                          {error?.message}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Subscribe>
                {(state) => (
                  <Button
                    type="submit"
                    className="w-full px-8 text-base shadow-sm transition-all duration-300 hover:shadow-md"
                    disabled={!state.canSubmit || state.isSubmitting}
                  >
                    {state.isSubmitting ? "Signing in..." : "Sign In"}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                )}
              </form.Subscribe>
            </form>

            {/* Helper links similar to hero helper links */}
            <div className="mt-6 flex flex-wrap justify-between text-sm text-muted-foreground">
              <Link
                href="/forgot-password"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-indigo-600 underline-offset-4 hover:text-indigo-800 hover:underline"
              >
                Need an account? Sign Up
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
