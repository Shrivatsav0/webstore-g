// apps/server/procedures/checkout.ts
import { db } from "../../db";
import { orders, orderItems, carts, cartItems } from "../../db/schema/cart";
import { products } from "../../db/schema/categories";
import { os } from "@orpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { configureLemonSqueezy } from "../../lib/lemonsqueezy";

// Create checkout session with dynamic product info
export const createCheckoutSession = os
  .input(
    z.object({
      sessionId: z.string(),
      userId: z.string().optional(),
      customerEmail: z.string().email().optional(),
      customerName: z.string().optional(),
      redirectUrl: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
    try {
      configureLemonSqueezy();

      // Get cart with items
      const cart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, input.sessionId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!cart) {
        throw new Error("Cart not found");
      }

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

      if (items.length === 0) {
        throw new Error("Cart is empty");
      }

      // Calculate totals
      const subtotal = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      // Create order record
      const [order] = await db
        .insert(orders)
        .values({
          userId: input.userId,
          sessionId: input.sessionId,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          status: "pending",
          subtotal,
          total: subtotal,
          testMode: process.env.NODE_ENV !== "production",
          updatedAt: new Date(),
        })
        .returning();

      // Create order items
      await db.insert(orderItems).values(
        items.map((item) => ({
          orderId: order.id,
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity,
        }))
      );

      // Create dynamic product name and description
      const productName =
        items.length === 1
          ? items[0].product.name
          : `Order #${order.id} (${items.length} items)`;

      const productDescription =
        items.length === 1
          ? items[0].product.description
          : items
              .map((item) => `${item.quantity}x ${item.product.name}`)
              .join(", ");

      // Calculate the redirect URL - use WEB_APP_URL for frontend redirects
      const webAppUrl =
        process.env.NEXT_PUBLIC_APP_WEB_URL ||
        "https://test-2-web.vercel.app";
      const redirectUrl =
        input.redirectUrl || `${webAppUrl}/checkout/success?order=${order.id}`;

      console.log("=== REDIRECT URL DEBUG ===");
      console.log("WEB_APP_URL:", process.env.NEXT_PUBLIC_APP_WEB_URL);
      console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
      console.log("Order ID:", order.id);
      console.log("Input redirect URL:", input.redirectUrl);
      console.log("Final redirect URL:", redirectUrl);
      // Get the first product image or use a default
      const productImage =
        items.find((item) => item.product.image)?.product.image || null;

      // Prepare custom data - only include non-empty strings
      const customData: Record<string, string> = {
        order_id: order.id.toString(),
        session_id: input.sessionId,
      };

      // Only add user_id if it exists and is not empty
      if (input.userId && input.userId.trim() !== "") {
        customData.user_id = input.userId;
      }

      // Prepare checkout data - only include defined values
      const checkoutData: any = {
        custom: customData,
      };

      if (input.customerEmail) {
        checkoutData.email = input.customerEmail;
      }

      if (input.customerName) {
        checkoutData.name = input.customerName;
      }

      const checkoutPayload = {
        data: {
          type: "checkouts",
          attributes: {
            custom_price: subtotal, // Price in cents
            product_options: {
              name: productName,
              description: productDescription,
              media: productImage ? [productImage] : [],
              redirect_url: redirectUrl, // Use the calculated URL
              receipt_button_text: "View Order",
              receipt_thank_you_note: "Thank you for your purchase!",
            },
            checkout_options: {
              embed: true, // Enable overlay
              media: true, // Show product image
              logo: true, // Show store logo
              desc: true, // Show description
              discount: true, // Show discount field
              button_color: "#7047EB", // Custom button color
            },
            checkout_data: checkoutData,
            test_mode: process.env.NODE_ENV !== "production",
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: process.env.LEMONSQUEEZY_STORE_ID!,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: process.env.LEMONSQUEEZY_GENERIC_VARIANT_ID!,
              },
            },
          },
        },
      };

      console.log("=== LEMONSQUEEZY PAYLOAD ===");
      console.log("Full payload:", JSON.stringify(checkoutPayload, null, 2));
      console.log("============================");

      // Create checkout using LemonSqueezy API
      const response = await fetch(
        "https://api.lemonsqueezy.com/v1/checkouts",
        {
          method: "POST",
          headers: {
            Accept: "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
          },
          body: JSON.stringify(checkoutPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("LemonSqueezy API Error:", errorData);
        throw new Error(
          `Failed to create checkout: ${response.status} - ${errorData}`
        );
      }

      const checkout = await response.json();

      console.log("=== LEMONSQUEEZY RESPONSE ===");
      console.log("Checkout response:", JSON.stringify(checkout, null, 2));
      console.log("============================");

      if (!checkout.data?.attributes?.url) {
        throw new Error("No checkout URL returned from LemonSqueezy");
      }

      // Update order with checkout info
      await db
        .update(orders)
        .set({
          lemonSqueezyCheckoutId: checkout.data.id,
          checkoutUrl: checkout.data.attributes.url,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      return {
        checkoutUrl: checkout.data.attributes.url,
        orderId: order.id,
      };
    } catch (err) {
      console.error("Error in createCheckoutSession:", err);
      throw err;
    }
  });

// Get order details - Made explicit to fix TypeScript issues
export const getOrder = os
  .input(z.object({ orderId: z.number() }))
  .handler(async ({ input }) => {
    try {
      console.log("Getting order with ID:", input.orderId);

      const order = await db
        .select({
          id: orders.id,
          lemonSqueezyOrderId: orders.lemonSqueezyOrderId,
          lemonSqueezyCheckoutId: orders.lemonSqueezyCheckoutId,
          userId: orders.userId,
          sessionId: orders.sessionId,
          customerEmail: orders.customerEmail,
          customerName: orders.customerName,
          status: orders.status, // Explicitly select status field
          currency: orders.currency,
          subtotal: orders.subtotal,
          tax: orders.tax,
          total: orders.total,
          checkoutUrl: orders.checkoutUrl,
          receiptUrl: orders.receiptUrl,
          refunded: orders.refunded,
          refundedAt: orders.refundedAt,
          testMode: orders.testMode,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
        })
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1)
        .then((rows) => rows[0]);

      console.log("Found order:", order ? "Yes" : "No");

      if (!order) {
        console.log("Order not found for ID:", input.orderId);

        // Check if any orders exist at all for debugging
        const allOrders = await db
          .select({
            id: orders.id,
            status: orders.status,
            createdAt: orders.createdAt,
          })
          .from(orders)
          .limit(10);

        console.log("All orders in database:", allOrders);
        throw new Error("Order not found");
      }

      console.log("Order status:", order.status);

      const items = await db
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          productName: orderItems.productName,
          quantity: orderItems.quantity,
          price: orderItems.price,
          total: orderItems.total,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      console.log("Order items count:", items.length);

      return {
        ...order,
        items,
      };
    } catch (err) {
      console.error("Error in getOrder:", err);
      throw err;
    }
  });

export const checkoutRoute = {
  create: createCheckoutSession,
  getOrder,
};
