import type { MetadataRoute } from 'next';
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { appRouter } from "../../../server/src/routers/index";
import type { RouterClient } from "@orpc/server";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://your-domain.com';

// Create ORPC client for server-side use
const link = new RPCLink({
  url: `${process.env.NEXT_PUBLIC_SERVER_URL}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

const client: RouterClient<typeof appRouter> = createORPCClient(link);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Get all categories and products via ORPC
    const allCategories = await client.categories.list();

    // Get products with a large limit to fetch all products
    const productsResponse = await client.products.list({
      page: 1,
      limit: 1000, // Large limit to get all products
      isActive: true // Only include active products in sitemap
    });
    const allProducts = productsResponse.data;

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: `${DOMAIN}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${DOMAIN}/categories`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${DOMAIN}/support`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }
    ];

    // Dynamic category pages
    const categoryPages: MetadataRoute.Sitemap = (allCategories || []).map(category => ({
      url: `${DOMAIN}/categories/${encodeURIComponent(category.href || category.id)}`,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Dynamic product pages
    const productPages: MetadataRoute.Sitemap = (allProducts || []).map(product => {
      const categoryHref = allCategories.find(cat => cat.id === product.categoryId)?.href || product.categoryId;
      const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      return {
        url: `${DOMAIN}/categories/${encodeURIComponent(categoryHref)}/${encodeURIComponent(productSlug)}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });

    // Combine all pages
    return [...staticPages, ...categoryPages, ...productPages];

  } catch (error) {
    console.error('Error generating sitemap:', error);

    // Return basic sitemap with just static pages if API fails
    return [
      {
        url: `${DOMAIN}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${DOMAIN}/categories`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${DOMAIN}/support`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }
    ];
  }
}
