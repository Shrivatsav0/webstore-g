import { pgTable, text } from "drizzle-orm/pg-core"

export const sectionProducts = pgTable("section_products", {
  sectionId: text("section_id").notNull(),
  productId: text("product_id").notNull(),
})
