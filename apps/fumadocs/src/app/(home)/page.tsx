import Link from "next/link";
import { Rocket, Settings2, ServerCog, BookOpenText } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-10">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">mc-webstore</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          A production-ready webstore template for Minecraft servers. Built with
          Next.js, oRPC, Better Auth, Drizzle, and Postgres. Deploy quickly and
          customize everything.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/docs/01-start-here/1.getting-started"
          className="group rounded-lg border border-border p-5 transition hover:bg-accent"
        >
          <div className="mb-2 inline-flex items-center gap-2 text-lg font-semibold">
            <Rocket className="h-5 w-5 text-primary" /> Get Started
          </div>
          <p className="text-sm text-muted-foreground">
            Install locally, set environment, run the apps.
          </p>
        </Link>
        <Link
          href="/docs/01-start-here/3.deploy-vercel"
          className="group rounded-lg border border-border p-5 transition hover:bg-accent"
        >
          <div className="mb-2 inline-flex items-center gap-2 text-lg font-semibold">
            <ServerCog className="h-5 w-5 text-primary" /> Deploy to Vercel
          </div>
          <p className="text-sm text-muted-foreground">
            Two-project monorepo deploy with server and web.
          </p>
        </Link>
        <Link
          href="/docs/03-customize/customize"
          className="group rounded-lg border border-border p-5 transition hover:bg-accent"
        >
          <div className="mb-2 inline-flex items-center gap-2 text-lg font-semibold">
            <Settings2 className="h-5 w-5 text-primary" /> Customize
          </div>
          <p className="text-sm text-muted-foreground">
            Branding, content, categories, products, images.
          </p>
        </Link>
        <Link
          href="/docs/02-development/api-reference"
          className="group rounded-lg border border-border p-5 transition hover:bg-accent"
        >
          <div className="mb-2 inline-flex items-center gap-2 text-lg font-semibold">
            <BookOpenText className="h-5 w-5 text-primary" /> API Reference
          </div>
          <p className="text-sm text-muted-foreground">
            Typed oRPC endpoints for server modules.
          </p>
        </Link>
      </div>
    </main>
  );
}
