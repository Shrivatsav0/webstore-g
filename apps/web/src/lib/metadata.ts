import type { Metadata } from "next";

/**
 * Generates dynamic metadata based on siteConfig
 * This function will be enhanced in the future to fetch from database
 */
export async function generateSiteMetadata(): Promise<Metadata> {
  // TODO: Implement database fetch when server-side database access is set up
  // For now, return static metadata with the structure ready for dynamic content

  const fallbackMetadata: Metadata = {
    title: "BlockShop",
    description: "BlockShop is a platform for buying and selling products for minecraft. Buy Random Items, Sell Random Items, and more!",
  };

  return fallbackMetadata;
}

/**
 * Utility to generate page-specific metadata with site defaults
 */
export function createPageMetadata(
  title: string,
  description?: string,
  image?: string
): Metadata {
  return {
    title,
    description: description || "BlockShop is a platform for buying and selling products for minecraft.",
    openGraph: {
      title,
      description: description || "BlockShop is a platform for buying and selling products for minecraft.",
      images: image ? [{ url: image, width: 800, height: 600, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || "BlockShop is a platform for buying and selling products for minecraft.",
      images: image ? [image] : undefined,
    },
  };
}
