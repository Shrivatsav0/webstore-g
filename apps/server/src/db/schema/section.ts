import { pgTable, text } from "drizzle-orm/pg-core"

export const categorySections = pgTable("category_sections", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
})
