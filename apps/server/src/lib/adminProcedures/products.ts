// procedures/products.ts
import { db } from "../../db";
import { products, categories } from "../../db/schema/categories";
import { os } from "@orpc/server";
import { adminProcedure } from "./adminProcedure";
import { productInput, productUpdateInput } from "../../zodschema/categories";
import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { z } from "zod";

// List products with pagination and filtering
export const listProducts = os
  .input(
    z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      categoryId: z.number().optional(),
      search: z.string().optional(),
      isActive: z.boolean().optional(),
    })
  )
  .handler(async ({ input }) => {
    const { page, limit, categoryId, search, isActive } = input;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (categoryId) {
      whereConditions.push(eq(products.categoryId, categoryId));
    }

    if (search) {
      whereConditions.push(ilike(products.name, `%${search}%`));
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(products.isActive, isActive));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [data, totalCount] = await Promise.all([
      db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          image: products.image,
          isActive: products.isActive,
          categoryId: products.categoryId,
          commands: products.commands,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          category: {
            id: categories.id,
            title: categories.title,
          },
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(whereClause)
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(products)
        .where(whereClause)
        .then((result) => result[0].count),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  });

// Get single product
export const getProduct = os
  .input(z.object({ id: z.number() }))
  .handler(async ({ input }) => {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        isActive: products.isActive,
        categoryId: products.categoryId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          title: categories.title,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, input.id))
      .limit(1);

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  });

// Create product
export const createProduct = adminProcedure
  .input(productInput)
  .handler(async ({ input }) => {
    const [result] = await db
      .insert(products)
      .values({
        ...input,
        updatedAt: new Date(),
      })
      .returning();

    return result;
  });

// Update product
export const updateProduct = adminProcedure
  .input(productUpdateInput)
  .handler(async ({ input }) => {
    const { id, ...updateData } = input;

    const [result] = await db
      .update(products)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (!result) {
      throw new Error("Product not found");
    }

    return result;
  });

// Delete product
export const deleteProduct = adminProcedure
  .input(z.object({ id: z.number() }))
  .handler(async ({ input }) => {
    const [result] = await db
      .delete(products)
      .where(eq(products.id, input.id))
      .returning();

    if (!result) {
      throw new Error("Product not found");
    }

    return result;
  });

export const productsRoute = {
  health: os.handler(async () => ({ status: "ok" })),
  list: listProducts,
  get: getProduct,
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct,
};
