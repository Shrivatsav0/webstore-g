import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import { Header } from "@/components/header";
import { generateSiteMetadata } from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito_sans = Nunito_Sans({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return await generateSiteMetadata();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito_sans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
