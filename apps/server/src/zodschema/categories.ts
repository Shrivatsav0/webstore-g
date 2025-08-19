// zodschema/categories.ts
import { z } from "zod";

export const categoryInput = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z
    .string()
    .min(5, "Description too short")
    .max(500, "Description too long"),
  image: z.string().url("Invalid image URL"),
  badge: z.string().max(50, "Badge too long").optional(),
  href: z.string().max(200, "URL too long").optional(),
});

export const categoryUpdateInput = categoryInput.partial().extend({
  id: z.number(),
});

// zodschema/products.ts
export const productInput = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z
    .string()
    .min(10, "Description too short")
    .max(1000, "Description too long"),
  price: z.number().min(0, "Price must be positive"),
  image: z.string().url("Invalid image URL").optional(),
  categoryId: z.number().min(1, "Category is required"),
  stock: z.number().min(0, "Stock must be non-negative").default(0),
  isActive: z.boolean().default(true),
  commands: z
    .array(z.string().min(1, "Command cannot be empty"))
    .default([])
    .refine(
      (commands) => {
        return commands.every((cmd) => cmd.includes("{user}"));
      },
      {
        message: "All commands must contain {user} placeholder",
      }
    ),
});

export const productUpdateInput = productInput.partial().extend({
  id: z.number(),
});
