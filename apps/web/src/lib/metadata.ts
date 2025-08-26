import type { Metadata } from "next";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://your-domain.com';
const SITE_NAME = "BlockShop";
const DEFAULT_DESCRIPTION = "BlockShop is a platform for buying and selling products for minecraft. Buy Random Items, Sell Random Items, and more!";

/**
 * Generates dynamic metadata based on siteConfig
 * This function will be enhanced in the future to fetch from database
 */
export async function generateSiteMetadata(): Promise<Metadata> {
  // TODO: Implement database fetch when server-side database access is set up
  // For now, return static metadata with the structure ready for dynamic content

  const fallbackMetadata: Metadata = {
    metadataBase: new URL(DOMAIN),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: [
      "minecraft",
      "gaming",
      "shop",
      "items",
      "ranks",
      "crates",
      "cosmetics",
      "ecommerce",
      "webstore",
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: DOMAIN,
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      siteName: SITE_NAME,
      images: [
        {
          url: `${DOMAIN}/og-image.png`,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      images: [`${DOMAIN}/og-image.png`],
      creator: "@yourhandle", // Replace with actual Twitter handle
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code", // Replace with actual verification code
      // yandex: "your-yandex-verification-code",
      // yahoo: "your-yahoo-verification-code",
    },
    alternates: {
      canonical: DOMAIN,
    },
  };

  return fallbackMetadata;
}

/**
 * Utility to generate page-specific metadata with site defaults
 */
export function createPageMetadata(
  title: string,
  description?: string,
  image?: string,
  path?: string
): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const canonicalUrl = path ? `${DOMAIN}${path}` : DOMAIN;
  const imageUrl = image || `${DOMAIN}/og-image.png`;

  return {
    title: fullTitle,
    description: finalDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description: finalDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: finalDescription,
      images: [imageUrl],
      creator: "@yourhandle", // Replace with actual Twitter handle
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Generate structured data for products
 */
export function generateProductStructuredData(product: {
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2), // Convert cents to dollars
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
}

/**
 * Generate structured data for the organization
 */
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: DOMAIN,
    logo: `${DOMAIN}/logo.png`,
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      // Add your social media URLs here
      // "https://twitter.com/yourhandle",
      // "https://facebook.com/yourpage",
      // "https://instagram.com/yourhandle",
    ],
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
