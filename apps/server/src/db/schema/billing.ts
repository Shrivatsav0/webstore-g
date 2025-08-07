import { z } from "zod"

export const billingInfoSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  paymentMethod: z.string(),
})

export const purchaseItemSchema = z.object({
  name: z.string(),
  qty: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
})

export const purchaseSchema = z.object({
  id: z.string(),
  dateISO: z.string().datetime(),
  items: z.array(purchaseItemSchema),
  totalCents: z.number().int().nonnegative(),
  status: z.enum(["paid", "refunded", "pending"]),
})
