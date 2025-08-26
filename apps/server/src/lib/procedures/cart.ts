// apps/server/procedures/cart.ts
import { db } from "../../db";
import { carts, cartItems } from "../../db/schema/cart";
import { products } from "../../db/schema/categories";
import { orders } from "../../db/schema/cart"; // Add this import if you have orders schema
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

// Enhanced clear cart with order completion verification
export const clearCart = os
  .input(
    z.object({
      sessionId: z.string(),
      orderId: z.number().optional(), // Optional order ID for verification
      force: z.boolean().default(false), // Force clear even without order verification
    })
  )
  .handler(async ({ input }) => {
    try {
      const cart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, input.sessionId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!cart) {
        return { success: true, message: "Cart not found" };
      }

      // If orderId is provided, verify the order exists and is completed
      if (input.orderId && !input.force) {
        try {
          // Check if order exists and is in a completed state
          // Adjust this query based on your orders schema
          const order = await db
            .select()
            .from(orders)
            .where(eq(orders.id, input.orderId))
            .limit(1)
            .then((rows) => rows[0]);

          if (!order) {
            throw new Error(`Order ${input.orderId} not found`);
          }

          // Only clear cart if order is in completed/paid state
          const completedStates = ["completed", "paid", "fulfilled"];
          if (!completedStates.includes(order.status)) {
            console.log(
              `Order ${input.orderId} is not completed (status: ${order.status}), skipping cart clear`
            );
            return {
              success: false,
              message: `Order not completed (status: ${order.status})`,
              orderStatus: order.status,
            };
          }

          console.log(
            `Order ${input.orderId} verified as completed, clearing cart`
          );
        } catch (orderError) {
          console.error("Error verifying order:", orderError);
          if (!input.force) {
            throw new Error("Cannot clear cart: order verification failed");
          }
        }
      }

      // Clear all cart items
      const deletedItems = await db
        .delete(cartItems)
        .where(eq(cartItems.cartId, cart.id))
        .returning();

      console.log(`Cleared ${deletedItems.length} items from cart ${cart.id}`);

      // Optionally mark cart as cleared instead of keeping it empty
      await db
        .update(carts)
        .set({
          updatedAt: new Date(),
          // Add a clearedAt timestamp if you have this column
          // clearedAt: new Date(),
          // orderId: input.orderId // Link cart to order if you have this column
        })
        .where(eq(carts.id, cart.id));

      return {
        success: true,
        message: `Cleared ${deletedItems.length} items`,
        clearedItems: deletedItems.length,
      };
    } catch (err) {
      console.error("Error in clearCart:", err);
      throw err;
    }
  });

// New: Get cart for order processing (preserves cart during order creation)
export const getCartForOrder = os
  .input(z.object({ sessionId: z.string() }))
  .handler(async ({ input }) => {
    try {
      // Same as getCart but with additional logging for order processing
      console.log(`Getting cart for order processing: ${input.sessionId}`);

      const cart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, input.sessionId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!cart) {
        throw new Error("Cart not found for order processing");
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
          },
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cart.id));

      if (items.length === 0) {
        throw new Error("Cart is empty, cannot process order");
      }

      const result = {
        ...cart,
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        total: items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
      };

      console.log(
        `Cart for order: ${items.length} items, total: $${result.total / 100}`
      );
      return result;
    } catch (err) {
      console.error("Error in getCartForOrder:", err);
      throw err;
    }
  });

// New: Clear cart only after successful order completion
export const clearCartAfterOrder = os
  .input(
    z.object({
      sessionId: z.string(),
      orderId: z.number(),
      waitForCompletion: z.boolean().default(true),
    })
  )
  .handler(async ({ input }) => {
    try {
      if (input.waitForCompletion) {
        // Wait a bit to ensure order processing is complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Call the clearCart handler directly with the same logic
      const cart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, input.sessionId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!cart) {
        return { success: true, message: "Cart not found" };
      }

      // Verify order exists and is completed if orderId provided
      if (input.orderId) {
        try {
          // Check if order exists and is in a completed state
          const order = await db
            .select()
            .from(orders)
            .where(eq(orders.id, input.orderId))
            .limit(1)
            .then((rows) => rows[0]);

          if (!order) {
            throw new Error(`Order ${input.orderId} not found`);
          }

          // Only clear cart if order is in completed/paid state
          const completedStates = ["completed", "paid", "fulfilled"];
          if (!completedStates.includes(order.status)) {
            console.log(
              `Order ${input.orderId} is not completed (status: ${order.status}), skipping cart clear`
            );
            return {
              success: false,
              message: `Order not completed (status: ${order.status})`,
              orderStatus: order.status,
            };
          }

          console.log(
            `Order ${input.orderId} verified as completed, clearing cart`
          );
        } catch (orderError) {
          console.error("Error verifying order:", orderError);
          throw new Error("Cannot clear cart: order verification failed");
        }
      }

      // Clear all cart items
      const deletedItems = await db
        .delete(cartItems)
        .where(eq(cartItems.cartId, cart.id))
        .returning();

      console.log(
        `Cleared ${deletedItems.length} items from cart ${cart.id} after order ${input.orderId}`
      );

      // Update cart timestamp
      await db
        .update(carts)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(carts.id, cart.id));

      return {
        success: true,
        message: `Cleared ${deletedItems.length} items after order completion`,
        clearedItems: deletedItems.length,
        orderId: input.orderId,
      };
    } catch (err) {
      console.error("Error in clearCartAfterOrder:", err);
      throw err;
    }
  });

export const cartRoute = {
  get: getCart,
  add: addToCart,
  update: updateCartItem,
  remove: removeFromCart,
  clear: clearCart,
  getForOrder: getCartForOrder, // New: For order processing
  clearAfterOrder: clearCartAfterOrder, // New: For post-order clearing
};
