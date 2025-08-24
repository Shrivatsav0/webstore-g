import { db } from "../../db";
import { user } from "../../db/schema/auth";
import { os } from "@orpc/server";
import { eq, count } from "drizzle-orm";
import { z } from "zod";

// Check if user should be admin (first user gets admin role)
export const checkAndAssignAdminRole = os
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      // Count total users in the system (including the one just created)
      const userCountResult = await db.select({ count: count() }).from(user);
      const totalUsers = userCountResult[0]?.count || 0;

      // If this is the first user (totalUsers === 1), assign admin role
      if (totalUsers === 1) {
        // First check what the current role is
        const currentUser = await db
          .select({ role: user.role })
          .from(user)
          .where(eq(user.id, input.userId))
          .limit(1);

        // Only update if not already admin
        if (currentUser[0]?.role !== "admin") {
          await db
            .update(user)
            .set({ role: "admin" })
            .where(eq(user.id, input.userId));
        }

        return {
          isAdmin: true,
          message: "First user automatically assigned admin role",
          totalUsers: 1,
        };
      }

      return {
        isAdmin: false,
        message: "User assigned default role",
        totalUsers,
      };
    } catch (err) {
      console.error("Error in checkAndAssignAdminRole:", err);
      throw err;
    }
  });

// Get user role
export const getUserRole = os
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const userResult = await db
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      return userResult[0]?.role || "user";
    } catch (err) {
      console.error("Error in getUserRole:", err);
      throw err;
    }
  });

// Get total user count
export const getUserCount = os.input(z.void()).handler(async () => {
  try {
    const userCountResult = await db.select({ count: count() }).from(user);

    return { count: userCountResult[0]?.count || 0 };
  } catch (err) {
    console.error("Error in getUserCount:", err);
    throw err;
  }
});
