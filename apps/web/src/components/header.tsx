"use client";

import Link from "next/link";
import UserMenu from "./user-menu";
import ModeToggle from "./mode-toggle";
import { ShoppingBag } from "lucide-react";
import { links } from "../../../../data/data";
export function Header() {
  return (
    <header className="bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-row items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="size-8 text-foreground" />
            <span className="text-2xl font-bold text-foreground">Store</span>
          </Link>
          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {links.map(({ to, label }) => (
                <Link
                  key={to}
                  href={to}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
