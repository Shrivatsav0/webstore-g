// zodschema/support.ts
import { z } from "zod";

// Support Config
export const supportConfigInput = z.object({
  heroTitle: z.string().max(100),
  heroSubtitle: z.string().max(150),
  heroDescription: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  businessHours: z.string().max(100),
  responseTime: z.string().max(50),
});

export const supportConfigUpdate = supportConfigInput.extend({
  id: z.number(),
});

// FAQ Categories
export const faqCategoryInput = z.object({
  title: z.string().max(50),
  description: z.string().max(200),
  icon: z.string().max(50),
  order: z.number(),
  isActive: z.boolean().default(true),
});

export const faqCategoryUpdate = faqCategoryInput.extend({
  id: z.number(),
});

// FAQ Category Delete
export const faqCategoryDeleteInput = z.object({
  id: z.number(),
});

// FAQs
export const faqInput = z.object({
  categoryId: z.number(),
  question: z.string().max(200),
  answer: z.string(),
  order: z.number(),
  isActive: z.boolean().default(true),
});

export const faqUpdate = faqInput.extend({
  id: z.number(),
});

// FAQ Delete
export const faqDeleteInput = z.object({
  id: z.number(),
});

// Contact Methods
export const contactMethodInput = z.object({
  title: z.string().max(50),
  description: z.string().max(200),
  icon: z.string().max(50),
  contactInfo: z.string().max(200),
  isActive: z.boolean().default(true),
  order: z.number(),
});

export const contactMethodUpdate = contactMethodInput.extend({
  id: z.number(),
});
