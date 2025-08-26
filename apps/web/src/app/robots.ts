import type { MetadataRoute } from 'next';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://your-domain.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/checkout/',
          '/login/',
          '/api/',
          '/test/',
          '/_next/',
          '/_vercel/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/checkout/',
          '/login/',
          '/api/',
          '/test/',
          '/_next/',
          '/_vercel/',
          '/private/',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${DOMAIN}/sitemap.xml`,
    host: DOMAIN,
  };
}
