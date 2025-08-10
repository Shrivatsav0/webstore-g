import { db } from "../../db";
import { hero } from "../../db/schema/landing";
import { os } from "@orpc/server";
import { adminProcedure } from "./adminProcedure";
import { heroInput } from "../../zodschema/hero";
import { eq } from "drizzle-orm";

export const listHeroConfig = os.handler(async () => {
  return await db.select().from(hero).where(eq(hero.id, 1));
});

export const upsertHeroConfig = adminProcedure
  .input(heroInput)
  .handler(async ({ input }) => {
    const data = { ...input, id: 1 };

    const [result] = await db
      .insert(hero)
      .values(data)
      .onConflictDoUpdate({
        target: hero.id,
        set: {
          ...input,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result;
  });

export const heroConfigRoute = {
  list: listHeroConfig,
  upsert: upsertHeroConfig,
};
