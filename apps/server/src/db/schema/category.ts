import { pgTable, text } from "drizzle-orm/pg-core"

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  badge: text("badge"),
})
