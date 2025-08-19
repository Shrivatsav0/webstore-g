// db/schema/support.ts
import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const supportConfig = pgTable("support_config", {
  id: serial("id").primaryKey(),
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  heroDescription: text("hero_description").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  businessHours: text("business_hours").notNull(),
  responseTime: text("response_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const faqCategories = pgTable("faq_categories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Icon name for lucide-react
  order: serial("order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  categoryId: serial("category_id").references(() => faqCategories.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: serial("order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contactMethods = pgTable("contact_methods", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  contactInfo: text("contact_info").notNull(),
  isActive: boolean("is_active").default(true),
  order: serial("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
