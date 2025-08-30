import { db } from "../../db";
import { mcUsers } from "../../db/schema/cart";
import { os } from "@orpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Minecraft username validation regex
const MINECRAFT_USERNAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/;

// Get or create MC user for session
export const getMcUser = os
  .input(
    z.object({
      sessionId: z.string(),
      userId: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const mcUser = await db
        .select()
        .from(mcUsers)
        .where(eq(mcUsers.sessionId, input.sessionId))
        .limit(1)
        .then((rows) => rows[0] || null);

      return mcUser;
    } catch (err) {
      console.error("Error in getMcUser:", err);
      throw err;
    }
  });

// Set Minecraft username for session
export const setMcUsername = os
  .input(
    z.object({
      sessionId: z.string(),
      userId: z.string().optional(),
      minecraftUsername: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(16, "Username must be at most 16 characters")
        .regex(
          MINECRAFT_USERNAME_REGEX,
          "Username can only contain letters, numbers, and underscores"
        ),
    })
  )
  .handler(async ({ input }) => {
    try {
      // Check if MC user already exists for this session
      const existingMcUser = await db
        .select()
        .from(mcUsers)
        .where(eq(mcUsers.sessionId, input.sessionId))
        .limit(1)
        .then((rows) => rows[0] || null);

      let mcUser;

      if (existingMcUser) {
        // Update existing
        [mcUser] = await db
          .update(mcUsers)
          .set({
            minecraftUsername: input.minecraftUsername,
            userId: input.userId,
            lastUsed: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(mcUsers.id, existingMcUser.id))
          .returning();
      } else {
        // Create new
        [mcUser] = await db
          .insert(mcUsers)
          .values({
            sessionId: input.sessionId,
            userId: input.userId,
            minecraftUsername: input.minecraftUsername,
            lastUsed: new Date(),
          })
          .returning();
      }

      return mcUser;
    } catch (err) {
      console.error("Error in setMcUsername:", err);
      throw err;
    }
  });

// Validate if MC username is required for checkout
export const validateMcUserForCheckout = os
  .input(z.object({ sessionId: z.string() }))
  .handler(async ({ input }) => {
    try {
      const mcUser = await db
        .select()
        .from(mcUsers)
        .where(eq(mcUsers.sessionId, input.sessionId))
        .limit(1)
        .then((rows) => rows[0] || null);

      return {
        hasUsername: !!mcUser?.minecraftUsername,
        username: mcUser?.minecraftUsername || null,
        isValid:
          !!mcUser?.minecraftUsername &&
          MINECRAFT_USERNAME_REGEX.test(mcUser.minecraftUsername),
      };
    } catch (err) {
      console.error("Error in validateMcUserForCheckout:", err);
      throw err;
    }
  });

export const mcUsersRoute = {
  health: os.handler(async () => ({ status: "ok" })),
  get: getMcUser,
  setUsername: setMcUsername,
  validateForCheckout: validateMcUserForCheckout,
};
