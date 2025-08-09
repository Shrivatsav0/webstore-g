import { z } from "zod";

// siteConfig
export const siteConfigInput = z.object({
  name: z.string().max(100),
  url: z.string().max(255),
  description: z.string(),
});
export const siteConfigUpdate = siteConfigInput.extend({ id: z.number() });

// hero
export const heroInput = z.object({
  badgeText: z.string().max(50),
  title: z.string().max(100),
  subtitle: z.string().max(150),
  description: z.string(),
});
export const heroUpdate = heroInput.extend({ id: z.number() });

// features
export const featuresInput = z.object({
  title: z.string().max(80),
  description: z.string(),
});
export const featuresUpdate = featuresInput.extend({ id: z.number() });

// categories
export const categoriesInput = z.object({
  title: z.string().max(50),
  description: z.string().max(150),
  image: z.string().max(255),
});
export const categoriesUpdate = categoriesInput.extend({ id: z.number() });

// newsletter
export const newsletterInput = z.object({
  title: z.string().max(80),
  description: z.string(),
});
export const newsletterUpdate = newsletterInput.extend({ id: z.number() });

// footer
export const footerInput = z.object({
  description: z.string(),
});
export const footerUpdate = footerInput.extend({ id: z.number() });
