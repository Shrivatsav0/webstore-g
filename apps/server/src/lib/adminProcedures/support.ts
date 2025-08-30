// orpc/support.ts
import { db } from "../../db";
import {
  supportConfig,
  faqCategories,
  faqs,
  contactMethods,
} from "../../db/schema/support";
import { os } from "@orpc/server";
import { adminProcedure } from "./adminProcedure";
import {
  supportConfigInput,
  faqCategoryInput,
  faqCategoryUpdate,
  faqInput,
  faqUpdate,
  contactMethodInput,
  faqCategoryDeleteInput,
  faqDeleteInput,
} from "../../zodschema/support";
import { eq } from "drizzle-orm";

// Support Config
export const listSupportConfig = os.handler(async () => {
  return await db.select().from(supportConfig).where(eq(supportConfig.id, 1));
});

export const upsertSupportConfig = adminProcedure
  .input(supportConfigInput)
  .handler(async ({ input }) => {
    const data = { ...input, id: 1 };

    const [result] = await db
      .insert(supportConfig)
      .values(data)
      .onConflictDoUpdate({
        target: supportConfig.id,
        set: {
          ...input,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result;
  });

// FAQ Categories
export const listFaqCategories = os.handler(async () => {
  return await db
    .select()
    .from(faqCategories)
    .where(eq(faqCategories.isActive, true))
    .orderBy(faqCategories.order);
});

export const upsertFaqCategory = adminProcedure
  .input(faqCategoryUpdate.or(faqCategoryInput))
  .handler(async ({ input }) => {
    const [result] = await db
      .insert(faqCategories)
      .values(input)
      .onConflictDoUpdate({
        target: faqCategories.id,
        set: {
          ...input,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result;
  });

// FAQs
export const listFaqs = os.handler(async () => {
  return await db
    .select()
    .from(faqs)
    .where(eq(faqs.isActive, true))
    .orderBy(faqs.categoryId, faqs.order);
});

export const upsertFaq = adminProcedure
  .input(faqUpdate.or(faqInput))
  .handler(async ({ input }) => {
    const [result] = await db
      .insert(faqs)
      .values(input)
      .onConflictDoUpdate({
        target: faqs.id,
        set: {
          ...input,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result;
  });

// Hard deletes
export const deleteFaqCategory = adminProcedure
  .input(faqCategoryDeleteInput)
  .handler(async ({ input }) => {
    await db.delete(faqCategories).where(eq(faqCategories.id, input.id));
    return { success: true } as const;
  });

export const deleteFaq = adminProcedure
  .input(faqDeleteInput)
  .handler(async ({ input }) => {
    await db.delete(faqs).where(eq(faqs.id, input.id));
    return { success: true } as const;
  });

// Contact Methods
export const listContactMethods = os.handler(async () => {
  return await db
    .select()
    .from(contactMethods)
    .where(eq(contactMethods.isActive, true))
    .orderBy(contactMethods.order);
});

export const upsertContactMethod = adminProcedure
  .input(contactMethodInput)
  .handler(async ({ input }) => {
    const [result] = await db
      .insert(contactMethods)
      .values(input)
      .onConflictDoUpdate({
        target: contactMethods.id,
        set: {
          ...input,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result;
  });

export const supportRoute = {
  health: os.handler(async () => ({ status: "ok" })),
  config: {
    list: listSupportConfig,
    upsert: upsertSupportConfig,
  },
  faqCategories: {
    list: listFaqCategories,
    upsert: upsertFaqCategory,
    delete: deleteFaqCategory,
  },
  faqs: {
    list: listFaqs,
    upsert: upsertFaq,
    delete: deleteFaq,
  },
  contactMethods: {
    list: listContactMethods,
    upsert: upsertContactMethod,
  },
};
