// procedures/categories.ts
import { db } from "../../db";
import { categories, products } from "../../db/schema/categories";
import { os } from "@orpc/server";
import { adminProcedure } from "./adminProcedure";
import { categoryInput, categoryUpdateInput } from "../../zodschema/categories";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";

// List all categories with product count
export const listCategories = os.handler(async () => {
  try {
   
    const result = await db
      .select({
        id: categories.id,
        title: categories.title,
        description: categories.description,
        image: categories.image,
        badge: categories.badge,
        href: categories.href,
        count: sql<number>`coalesce(count(${products.id}), 0)`,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .groupBy(
        categories.id,
        categories.title,
        categories.description,
        categories.image,
        categories.badge,
        categories.href,
        categories.createdAt,
        categories.updatedAt
      )
      .orderBy(desc(categories.createdAt));
    return result;
  } catch (err) {
    console.error("Error in listCategories:", err);
    throw err;
  }
});

// Get single category
export const getCategory = os
  .input(z.object({ id: z.number() }))
  .handler(async ({ input }) => {
    try {
      console.log("getCategory handler called with input:", input);
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, input.id))
        .limit(1);

      if (!category) {
        throw new Error("Category not found");
      }

      return category;
    } catch (err) {
      console.error("Error in getCategory:", err);
      throw err;
    }
  });

// Create category
export const createCategory = adminProcedure
  .input(categoryInput)
  .handler(async ({ input }) => {
    try {
      console.log("createCategory handler called with input:", input);
      const [result] = await db
        .insert(categories)
        .values({
          ...input,
          updatedAt: new Date(),
        })
        .returning();

      return result;
    } catch (err) {
      console.error("Error in createCategory:", err);
      throw err;
    }
  });

// Update category
export const updateCategory = adminProcedure
  .input(categoryUpdateInput)
  .handler(async ({ input }) => {
    try {
      console.log("updateCategory handler called with input:", input);
      const { id, ...updateData } = input;

      const [result] = await db
        .update(categories)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, id))
        .returning();

      if (!result) {
        throw new Error("Category not found");
      }

      return result;
    } catch (err) {
      console.error("Error in updateCategory:", err);
      throw err;
    }
  });

// Delete category
export const deleteCategory = adminProcedure
  .input(z.object({ id: z.number() }))
  .handler(async ({ input }) => {
    try {
      console.log("deleteCategory handler called with input:", input);
      // Check if category has products
      const [productCount] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(products)
        .where(eq(products.categoryId, input.id));

      if (productCount.count > 0) {
        throw new Error("Cannot delete category with existing products");
      }

      const [result] = await db
        .delete(categories)
        .where(eq(categories.id, input.id))
        .returning();

      if (!result) {
        throw new Error("Category not found");
      }

      return result;
    } catch (err) {
      console.error("Error in deleteCategory:", err);
      throw err;
    }
  });

export const categoriesRoute = {
  health: os.handler(async () => ({ status: "ok" })),
  list: listCategories,
  get: getCategory,
  create: createCategory,
  update: updateCategory,
  delete: deleteCategory,
};
