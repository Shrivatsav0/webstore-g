import { z } from "zod";

// siteConfig
export const siteConfigInput = z.object({
  name: z.string().max(100),
  url: z.string().max(255),
  description: z.string(),
  // merged header
  headerLogoText: z.string().max(50),
  headerLogoImage: z.string().max(255).optional(),
  headerShowLogo: z.boolean().default(true),
  // merged footer
  footerDescription: z.string(),
  footerCopyright: z.string().max(100),
  footerPoweredBy: z.string().max(50),
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
  id: z.number(), // or z.string() if your id is a string
  title: z.string(),
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

// header
export const headerInput = z.object({
  logoText: z.string().max(50),
  showLogo: z.boolean().default(true),
});
export const headerUpdate = headerInput.extend({ id: z.number() });

// footer
export const footerInput = z.object({
  description: z.string(),
  copyright: z.string().max(100),
  poweredBy: z.string().max(50),
});
export const footerUpdate = footerInput.extend({ id: z.number() });
