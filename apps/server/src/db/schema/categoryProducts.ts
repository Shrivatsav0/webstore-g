import { pgTable, text } from "drizzle-orm/pg-core"

export const categoryProducts = pgTable("category_products", {
  categoryId: text("category_id").notNull(),
  productId: text("product_id").notNull(),
})
