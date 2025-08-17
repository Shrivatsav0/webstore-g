// apps/server/db/schema/cart.ts
import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  json,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./categories";

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: text("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id")
    .references(() => carts.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  lemonSqueezyOrderId: text("lemonsqueezy_order_id").unique(),
  lemonSqueezyCheckoutId: text("lemonsqueezy_checkout_id").unique(),
  userId: text("user_id"),
  sessionId: text("session_id"),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerName: varchar("customer_name", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  subtotal: integer("subtotal").notNull(), // in cents
  tax: integer("tax").default(0).notNull(), // in cents
  total: integer("total").notNull(), // in cents
  checkoutUrl: text("checkout_url"),
  receiptUrl: text("receipt_url"),
  refunded: boolean("refunded").default(false).notNull(),
  refundedAt: timestamp("refunded_at"),
  testMode: boolean("test_mode").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  productName: varchar("product_name", { length: 200 }).notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // in cents
  total: integer("total").notNull(), // in cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
