import { pgTable, text, integer, boolean, real, jsonb } from "drizzle-orm/pg-core"

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug"),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  rating: real("rating").notNull(),
  inStock: boolean("in_stock").notNull(),
  discountPercent: integer("discount_percent"),
  gallery: jsonb("gallery").$type<string[]>(),
  features: jsonb("features").$type<string[]>(),
  details: jsonb("details").$type<{ label: string; value: string }[]>(),
  delivery: text("delivery"),
  requirements: jsonb("requirements").$type<string[]>(),
  whatsIncluded: jsonb("whats_included").$type<string[]>(),
  disclaimer: text("disclaimer"),
  inventoryNote: text("inventory_note"),
})
