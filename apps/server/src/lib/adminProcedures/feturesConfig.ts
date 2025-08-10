import { features } from "../../db/schema/landing";
import { adminProcedure } from "./adminProcedure";
import { os } from "@orpc/server";
import { db } from "../../db";
import { z } from "zod";
import { featuresInput } from "../../zodschema/hero";
import { sql } from "drizzle-orm";

// Accept an array of features
export const featuresArrayInput = z.array(featuresInput);

export const listFeturesConfig = os.handler(async () => {
  return await db.select().from(features);
});

const allowedIds = [1, 2, 3, 4];

export const upsertFeaturesConfig = adminProcedure
  .input(featuresArrayInput)
  .handler(async ({ input }) => {
    // Filter input to only allowed IDs
    const filteredInput = input.filter((feature) =>
      allowedIds.includes(feature.id)
    );

    if (filteredInput.length === 0) return [];

    const result = await db
      .insert(features)
      .values(filteredInput)
      .onConflictDoUpdate({
        target: features.id,
        set: {
          title: sql`excluded.title`,
          description: sql`excluded.description`,
          // add other fields as needed
        },
      })
      .returning();

    return result;
  });

export const featuresConfigRoute = {
  list: listFeturesConfig,
  upsert: upsertFeaturesConfig,
};
