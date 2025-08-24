import { db } from "../../db";
import { orders, orderItems, mcUsers } from "../../db/schema/cart";
import { os } from "@orpc/server";
import { adminProcedure } from "../adminProcedures/adminProcedure";
import { eq, desc, sql, and, ilike, or } from "drizzle-orm";
import { z } from "zod";

// List orders with pagination and filtering
export const listOrders = adminProcedure
    .input(
        z.object({
            page: z.number().default(1),
            limit: z.number().default(10),
            search: z.string().optional(),
            status: z.string().optional(),
            deliveryStatus: z.string().optional(),
            testMode: z.boolean().optional(),
        })
    )
    .handler(async ({ input }) => {
        const { page, limit, search, status, deliveryStatus, testMode } = input;
        const offset = (page - 1) * limit;

        let whereConditions = [];

        if (search) {
            whereConditions.push(
                or(
                    ilike(orders.customerEmail, `%${search}%`),
                    ilike(orders.customerName, `%${search}%`),
                    ilike(orders.lemonSqueezyOrderId, `%${search}%`)
                )
            );
        }

        if (status) {
            whereConditions.push(eq(orders.status, status));
        }

        if (deliveryStatus) {
            whereConditions.push(eq(orders.deliveryStatus, deliveryStatus));
        }

        if (testMode !== undefined) {
            whereConditions.push(eq(orders.testMode, testMode));
        }

        const whereClause =
            whereConditions.length > 0 ? and(...whereConditions) : undefined;

        const [data, totalCount] = await Promise.all([
            db
                .select({
                    id: orders.id,
                    lemonSqueezyOrderId: orders.lemonSqueezyOrderId,
                    lemonSqueezyCheckoutId: orders.lemonSqueezyCheckoutId,
                    userId: orders.userId,
                    sessionId: orders.sessionId,
                    mcUserId: orders.mcUserId,
                    customerEmail: orders.customerEmail,
                    customerName: orders.customerName,
                    status: orders.status,
                    currency: orders.currency,
                    subtotal: orders.subtotal,
                    tax: orders.tax,
                    total: orders.total,
                    checkoutUrl: orders.checkoutUrl,
                    receiptUrl: orders.receiptUrl,
                    refunded: orders.refunded,
                    refundedAt: orders.refundedAt,
                    testMode: orders.testMode,
                    deliveryStatus: orders.deliveryStatus,
                    deliveryAttempts: orders.deliveryAttempts,
                    deliveredAt: orders.deliveredAt,
                    deliveryError: orders.deliveryError,
                    customFields: orders.customFields,
                    createdAt: orders.createdAt,
                    updatedAt: orders.updatedAt,
                    mcUser: {
                        id: mcUsers.id,
                        minecraftUsername: mcUsers.minecraftUsername,
                        isVerified: mcUsers.isVerified,
                    },
                })
                .from(orders)
                .leftJoin(mcUsers, eq(orders.mcUserId, mcUsers.id))
                .where(whereClause)
                .orderBy(desc(orders.createdAt))
                .limit(limit)
                .offset(offset),

            db
                .select({ count: sql<number>`cast(count(*) as int)` })
                .from(orders)
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

// Get single order with items
export const getOrder = adminProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
        const [order] = await db
            .select({
                id: orders.id,
                lemonSqueezyOrderId: orders.lemonSqueezyOrderId,
                lemonSqueezyCheckoutId: orders.lemonSqueezyCheckoutId,
                userId: orders.userId,
                sessionId: orders.sessionId,
                mcUserId: orders.mcUserId,
                customerEmail: orders.customerEmail,
                customerName: orders.customerName,
                status: orders.status,
                currency: orders.currency,
                subtotal: orders.subtotal,
                tax: orders.tax,
                total: orders.total,
                checkoutUrl: orders.checkoutUrl,
                receiptUrl: orders.receiptUrl,
                refunded: orders.refunded,
                refundedAt: orders.refundedAt,
                testMode: orders.testMode,
                deliveryStatus: orders.deliveryStatus,
                deliveryAttempts: orders.deliveryAttempts,
                deliveredAt: orders.deliveredAt,
                deliveryError: orders.deliveryError,
                customFields: orders.customFields,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt,
                mcUser: {
                    id: mcUsers.id,
                    minecraftUsername: mcUsers.minecraftUsername,
                    isVerified: mcUsers.isVerified,
                },
            })
            .from(orders)
            .leftJoin(mcUsers, eq(orders.mcUserId, mcUsers.id))
            .where(eq(orders.id, input.id))
            .limit(1);

        if (!order) {
            throw new Error("Order not found");
        }

        // Get order items
        const items = await db
            .select({
                id: orderItems.id,
                orderId: orderItems.orderId,
                productId: orderItems.productId,
                productName: orderItems.productName,
                quantity: orderItems.quantity,
                price: orderItems.price,
                total: orderItems.total,
                commands: orderItems.commands,
                createdAt: orderItems.createdAt,
            })
            .from(orderItems)
            .where(eq(orderItems.orderId, input.id))
            .orderBy(orderItems.createdAt);

        return {
            ...order,
            items,
        };
    });

// Update order delivery status
export const updateOrderDeliveryStatus = adminProcedure
    .input(
        z.object({
            id: z.number(),
            deliveryStatus: z.string(),
            deliveryError: z.string().optional(),
        })
    )
    .handler(async ({ input }) => {
        const { id, deliveryStatus, deliveryError } = input;

        const [result] = await db
            .update(orders)
            .set({
                deliveryStatus,
                deliveryError: deliveryError || null,
                deliveredAt: deliveryStatus === "delivered" ? new Date() : null,
                updatedAt: new Date(),
            })
            .where(eq(orders.id, id))
            .returning();

        if (!result) {
            throw new Error("Order not found");
        }

        return result;
    });

export const ordersRoute = {
    list: listOrders,
    get: getOrder,
    updateDeliveryStatus: updateOrderDeliveryStatus,
};