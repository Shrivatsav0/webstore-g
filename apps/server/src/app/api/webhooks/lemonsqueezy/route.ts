// apps/server/app/api/webhooks/lemonsqueezy/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "../../../../db";
import { orders } from "../../../../db/schema/cart";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("LEMONSQUEEZY_WEBHOOK_SECRET not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        {
          status: 500,
        }
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get("X-Signature");

    if (!signature || !rawBody) {
      console.error("Missing signature or body");
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Verify webhook signature
    const hmac = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature !== hmac) {
      console.error("Invalid signature");
      console.error("Expected:", hmac);
      console.error("Received:", signature);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta?.event_name;

    console.log("Received webhook event:", eventName);
    console.log("Event data:", JSON.stringify(event, null, 2));

    switch (eventName) {
      case "order_created":
        await handleOrderCreated(event);
        break;
      case "order_refunded":
        await handleOrderRefunded(event);
        break;
      default:
        console.log("Unhandled event type:", eventName);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleOrderCreated(event: any) {
  try {
    const orderData = event.data.attributes;
    const customData = event.meta?.custom_data;

    console.log("Processing order_created event");
    console.log("Custom data:", customData);
    console.log("Order data:", orderData);

    // Find order by custom order_id
    let order = null;
    if (customData?.order_id) {
      try {
        const orderId = parseInt(customData.order_id);
        if (!isNaN(orderId)) {
          order = await db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1)
            .then((rows) => rows[0] || null);
        }
      } catch (parseError) {
        console.error("Error parsing order_id:", parseError);
      }
    }

    const orderUpdateData = {
      lemonSqueezyOrderId: event.data.id,
      status: orderData.status === "paid" ? "completed" : "pending",
      customerEmail: orderData.user_email,
      customerName: orderData.user_name,
      currency: orderData.currency,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      total: orderData.total,
      receiptUrl: orderData.urls?.receipt,
      testMode: orderData.test_mode || false,
      updatedAt: new Date(),
    };

    if (order) {
      // Update existing order
      console.log("Updating existing order with ID:", order.id);
      await db
        .update(orders)
        .set(orderUpdateData)
        .where(eq(orders.id, order.id));
    } else {
      // Create new order (fallback)
      console.log("Creating new order as fallback");
      await db.insert(orders).values({
        ...orderUpdateData,
        userId: customData?.user_id || null, // Handle missing user_id gracefully
        sessionId: customData?.session_id || null,
        createdAt: new Date(),
      });
    }

    console.log("Order created/updated successfully");
  } catch (error) {
    console.error("Error handling order_created:", error);
    throw error;
  }
}

async function handleOrderRefunded(event: any) {
  try {
    console.log("Processing order_refunded event");
    const orderData = event.data.attributes;

    const result = await db
      .update(orders)
      .set({
        status: "refunded",
        refunded: true,
        refundedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.lemonSqueezyOrderId, event.data.id));

    console.log("Order refunded successfully", result);
  } catch (error) {
    console.error("Error handling order_refunded:", error);
    throw error;
  }
}
