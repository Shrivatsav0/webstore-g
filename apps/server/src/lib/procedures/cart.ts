// apps/server/procedures/cart.ts
import { db } from "../../db";
import { carts, cartItems } from "../../db/schema/cart";
import { products } from "../../db/schema/categories";
import { os } from "@orpc/server";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

// Get or create cart
export const getCart = os
  .input(z.object({ sessionId: z.string(), userId: z.string().optional() }))
  .handler(async ({ input }) => {
    try {
      let cart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, input.sessionId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!cart) {
        [cart] = await db
          .insert(carts)
          .values({
            sessionId: input.sessionId,
            userId: input.userId,
            updatedAt: new Date(),
          })
          .returning();
      }

      // Get cart items with product details
      const items = await db
        .select({
          id: cartItems.id,
          quantity: cartItems.quantity,
          product: {
            id: products.id,
            name: products.name,
            description: products.description,
            price: products.price,
            image: products.image,
            stock: products.stock,
          },
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cart.id));

      return {
        ...cart,
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        total: items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
      };
    } catch (err) {
      console.error("Error in getCart:", err);
      throw err;
    }
  });

// Add item to cart
export const addToCart = os
  .input(
    z.object({
      sessionId: z.string(),
      userId: z.string().optional(),
      productId: z.number(),
      quantity: z.number().default(1),
    })
  )
  .handler(async ({ input }) => {
    try {
      // Get or create cart
      let cart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, input.sessionId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!cart) {
        [cart] = await db
          .insert(carts)
          .values({
            sessionId: input.sessionId,
            userId: input.userId,
            updatedAt: new Date(),
          })
          .returning();
      }

      // Check if item already exists in cart
      const existingItem = await db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.cartId, cart.id),
            eq(cartItems.productId, input.productId)
          )
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (existingItem) {
        // Update quantity
        await db
          .update(cartItems)
          .set({
            quantity: existingItem.quantity + input.quantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existingItem.id));
      } else {
        // Add new item
        await db.insert(cartItems).values({
          cartId: cart.id,
          productId: input.productId,
          quantity: input.quantity,
          updatedAt: new Date(),
        });
      }

      // Update cart timestamp
      await db
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cart.id));

      return { success: true };
    } catch (err) {
      console.error("Error in addToCart:", err);
      throw err;
    }
  });

// Update cart item quantity
export const updateCartItem = os
  .input(
    z.object({
      sessionId: z.string(),
      itemId: z.number(),
      quantity: z.number(),
    })
  )
  .handler(async ({ input }) => {
    try {
      if (input.quantity <= 0) {
        // Remove item if quantity is 0 or less
        await db.delete(cartItems).where(eq(cartItems.id, input.itemId));
      } else {
        // Update quantity
        await db
          .update(cartItems)
          .set({
            quantity: input.quantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, input.itemId));
      }

      return { success: true };
    } catch (err) {
      console.error("Error in updateCartItem:", err);
      throw err;
    }
  });

// Remove item from cart
export const removeFromCart = os
  .input(z.object({ sessionId: z.string(), itemId: z.number() }))
  .handler(async ({ input }) => {
    try {
      await db.delete(cartItems).where(eq(cartItems.id, input.itemId));
      return { success: true };
    } catch (err) {
      console.error("Error in removeFromCart:", err);
      throw err;
    }
  });

// Clear cart
export const clearCart = os
  .input(z.object({ sessionId: z.string() }))
  .handler(async ({ input }) => {
    try {
      const cart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, input.sessionId))
        .limit(1)
        .then((rows) => rows[0]);

      if (cart) {
        await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      }

      return { success: true };
    } catch (err) {
      console.error("Error in clearCart:", err);
      throw err;
    }
  });

export const cartRoute = {
  get: getCart,
  add: addToCart,
  update: updateCartItem,
  remove: removeFromCart,
  clear: clearCart,
};
