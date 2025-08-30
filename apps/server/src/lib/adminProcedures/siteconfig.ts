import { adminProcedure } from "./adminProcedure";
import { os } from "@orpc/server";
import { db } from "../../db";
import { siteConfig } from "../../db/schema/landing";
import { siteConfigInput } from "../../zodschema/hero";
import { eq } from "drizzle-orm";

// READ (public)
export const listSiteConfigs = os.handler(async () => {
  return await db.select().from(siteConfig).where(eq(siteConfig.id, 1));
});

export const upsertSiteConfig = adminProcedure
  .input(siteConfigInput)
  .handler(async ({ input }) => {
    const data = { ...input, id: 1 };

    const [result] = await db
      .insert(siteConfig)
      .values(data)
      .onConflictDoUpdate({
        target: siteConfig.id,
        set: {
          ...input,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  });
// Export as router
export const siteConfigRouter = {
  health: os.handler(async () => ({ status: "ok" })),
  list: listSiteConfigs,
  upsert: upsertSiteConfig,
};
