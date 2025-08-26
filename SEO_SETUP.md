# SEO Setup Guide for Webstore

This guide covers the SEO implementations added to your webstore using **Next.js 13+ App Router** native metadata API and how to optimize them for better search engine visibility.

## 🚀 What's Been Implemented

### 1. Native Next.js Sitemap (Recommended)
- **Location**: `/apps/web/src/app/sitemap.ts`
- **Features**:
  - Uses Next.js 13+ App Router native `MetadataRoute.Sitemap` API
  - Automatically generates XML sitemap with all pages
  - Includes static pages (home, categories, support)
  - Dynamically includes all category pages via ORPC
  - Dynamically includes all active product pages via ORPC
  - Proper priority and change frequency settings
  - URL encoding for special characters
  - Robust error handling with static fallback
  - **Accessible at**: `https://your-domain.com/sitemap.xml`

### 2. Native Next.js Robots.txt (Recommended)
- **Location**: `/apps/web/src/app/robots.ts`
- **Features**:
  - Uses Next.js 13+ App Router native `MetadataRoute.Robots` API
  - Allows search engines to crawl public content
  - Blocks admin, dashboard, and private areas
  - Configures specific rules for Googlebot
  - References sitemap location automatically
  - Configures crawl delay for better server performance
  - **Accessible at**: `https://your-domain.com/robots.txt`

### 3. Enhanced Metadata System
- **Location**: `/apps/web/src/lib/metadata.ts`
- **Features**:
  - Comprehensive meta tags for SEO
  - Open Graph tags for social media sharing
  - Twitter Card support
  - Structured data helpers for rich snippets
  - Canonical URL support
  - Breadcrumb structured data
  - Integration with Next.js 13+ App Router metadata API

## 🔧 Next.js 13+ App Router Implementation

This implementation follows **Next.js 13+ App Router best practices** and uses the native metadata API:

- **sitemap.ts**: Native Next.js sitemap generation (not route handlers)
- **robots.ts**: Native Next.js robots.txt generation (not route handlers)fea
- **Automatic caching**: Next.js automatically caches these files
- **TypeScript support**: Full type safety with `MetadataRoute` types
- **Zero configuration**: Works out of the box with proper file naming

> **Note**: We removed duplicate route handler implementations (`sitemap.xml/route.ts`, `robots.txt/route.ts`) as they conflict with the native App Router metadata API.

## 🔧 Configuration Required

### 1. Environment Variables
Add these to your `.env.local` file:

```env
# Your production domain (required for sitemaps and metadata)
NEXT_PUBLIC_DOMAIN=https://your-domain.com

# Server URL for API calls
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

### 2. Google Search Console
1. Verify your website ownership
2. Submit your sitemap: `https://your-domain.com/sitemap.xml`
3. Monitor crawling and indexing status

### 3. Social Media Optimization
Update the following in `/apps/web/src/lib/metadata.ts`:

```typescript
// Update Twitter handle
creator: "@yourhandle",

// Add social media URLs
sameAs: [
  "https://twitter.com/yourhandle",
  "https://facebook.com/yourpage",
  "https://instagram.com/yourhandle",
],
```

### 4. Google Analytics & Search Console Verification
Add verification codes in `/apps/web/src/lib/metadata.ts`:

```typescript
verification: {
  google: "your-google-verification-code",
  // yandex: "your-yandex-verification-code",
  // yahoo: "your-yahoo-verification-code",
},
```

## 📄 Page-Specific SEO

### Using createPageMetadata for Individual Pages

For any page that needs custom SEO metadata:

```typescript
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata(
    "Page Title",
    "Page description for SEO",
    "https://your-domain.com/page-image.jpg",
    "/page-path"
  );
}
```

### Adding Structured Data to Product Pages

For product pages, add structured data in the page component:

```typescript
import { generateProductStructuredData } from "@/lib/metadata";

export default function ProductPage({ product }) {
  const structuredData = generateProductStructuredData({
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category.title,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Your page content */}
    </>
  );
}
```

## 🎯 SEO Best Practices Implemented

### 1. Technical SEO
- ✅ XML Sitemap generation
- ✅ Robots.txt configuration
- ✅ Canonical URLs
- ✅ Meta descriptions and titles
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ Structured data schemas

### 2. Content SEO
- ✅ Proper heading hierarchy (H1, H2, H3)
- ✅ Alt tags for images
- ✅ Descriptive URLs (slug-based)
- ✅ Internal linking structure

### 3. Performance SEO
- ✅ Next.js Image optimization
- ✅ Code splitting and lazy loading
- ✅ Caching headers for static assets

## 🔍 Monitoring and Analytics

### Google Search Console Setup
1. Add and verify your property
2. Submit sitemap: `https://your-domain.com/sitemap.xml`
3. Monitor:
   - Index coverage
   - Search performance
   - Core Web Vitals
   - Mobile usability

### Recommended Tools
- **Google Search Console**: Monitor search performance
- **Google Analytics**: Track user behavior
- **PageSpeed Insights**: Monitor Core Web Vitals
- **GTmetrix**: Performance monitoring
- **Screaming Frog**: Technical SEO auditing

## 🚀 Next Steps

### 1. Content Optimization
- Add unique meta descriptions for each page
- Optimize product descriptions for target keywords
- Create category-specific landing pages
- Add FAQ sections for long-tail keywords

### 2. Technical Improvements
- Implement schema markup for reviews
- Add breadcrumb navigation
- Optimize for Core Web Vitals
- Set up proper 404 error handling

### 3. Local SEO (if applicable)
- Add business schema markup
- Create location-specific pages
- Optimize for local search terms

## 📋 SEO Checklist

- [ ] Configure environment variables
- [ ] Update domain in metadata.ts
- [ ] Add social media handles
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics
- [ ] Add verification codes
- [ ] Create custom 404 page
- [ ] Optimize images with alt tags
- [ ] Add structured data to key pages
- [ ] Monitor Core Web Vitals
- [ ] Set up performance monitoring

## 🛠️ Testing Your SEO Implementation

### 1. Sitemap Testing
```bash
# Check if sitemap is accessible (Next.js generates this automatically)
curl https://your-domain.com/sitemap.xml

# Validate XML format
xmllint --noout https://your-domain.com/sitemap.xml
```

### 2. Robots.txt Testing
```bash
# Check robots.txt (Next.js generates this automatically)
curl https://your-domain.com/robots.txt
```

### 3. Local Development Testing
```bash
# Start development server
bun dev

# Test sitemap locally
curl http://localhost:3000/sitemap.xml

# Test robots.txt locally
curl http://localhost:3000/robots.txt
```

### 3. Metadata Testing
- Use Google's Rich Results Test
- Check Open Graph with Facebook Debugger
- Validate Twitter Cards with Twitter Card Validator

## 📚 Additional Resources

- [Google Search Central](https://developers.google.com/search)
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Schema.org Documentation](https://schema.org/)
- [Web.dev SEO Guide](https://web.dev/learn/seo/)

---

**Note**: Remember to update the placeholder values (domain, social handles, verification codes) with your actual information before deploying to production.
