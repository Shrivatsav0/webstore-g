import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  description: text("description").notNull(),
  // Header fields (merged)
  headerLogoText: varchar("header_logo_text", { length: 50 }).notNull(),
  headerLogoImage: varchar("header_logo_image", { length: 255 }),
  headerShowLogo: boolean("header_show_logo").default(true).notNull(),
  // Footer fields (merged)
  footerDescription: text("footer_description").notNull(),
  footerCopyright: varchar("footer_copyright", { length: 100 }).notNull(),
  footerPoweredBy: varchar("footer_powered_by", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const hero = pgTable("hero", {
  id: serial("id").primaryKey(),
  badgeText: varchar("badge_text", { length: 50 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  subtitle: varchar("subtitle", { length: 150 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 80 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 50 }).notNull(),
  description: varchar("description", { length: 150 }).notNull(),
  image: varchar("image", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
