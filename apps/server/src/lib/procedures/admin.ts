// procedures/admin.ts
import { db } from "../../db";
import { user } from "../../db/schema/auth";
import { publicProcedure } from "../orpc";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Get all users with their roles
export const getAllUsers = publicProcedure
  .output(
    z.array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
        email: z.string(),
        role: z.string().nullable(),
        createdAt: z.date(),
        banned: z.boolean().nullable(),
      })
    )
  )
  .handler(async ({ context }) => {
    // Check if user is admin
    const currentUser = context.session?.user as { role?: string } | undefined;
    if (!currentUser) throw new Error("Unauthorized");

    const roles = (currentUser.role ?? "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    if (!roles.includes("admin")) {
      throw new Error("Admin access required");
    }

    try {
      const users = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          banned: user.banned,
        })
        .from(user)
        .orderBy(user.createdAt);

      return users;
    } catch (err) {
      console.error("Error in getAllUsers:", err);
      throw err;
    }
  });

// Toggle admin role for a user
export const toggleAdminRole = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      makeAdmin: z.boolean(),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
      user: z.object({
        id: z.string(),
        name: z.string().nullable(),
        email: z.string(),
        role: z.string().nullable(),
      }),
    })
  )
  .handler(async ({ input, context }) => {
    // Check if user is admin
    const currentUser = context.session?.user as { role?: string } | undefined;
    if (!currentUser) throw new Error("Unauthorized");

    const roles = (currentUser.role ?? "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    if (!roles.includes("admin")) {
      throw new Error("Admin access required");
    }

    try {
      // Get current user data
      const targetUser = await db
        .select()
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!targetUser) {
        throw new Error("User not found");
      }

      // Parse current roles
      const currentRoles = (targetUser.role ?? "")
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      let newRoles: string[];

      if (input.makeAdmin) {
        // Add admin role if not present
        if (!currentRoles.includes("admin")) {
          newRoles = [...currentRoles, "admin"];
        } else {
          newRoles = currentRoles;
        }
      } else {
        // Remove admin role
        newRoles = currentRoles.filter((role) => role !== "admin");
      }

      const newRoleString = newRoles.length > 0 ? newRoles.join(",") : null;

      // Update user
      const [updatedUser] = await db
        .update(user)
        .set({
          role: newRoleString,
          updatedAt: new Date(),
        })
        .where(eq(user.id, input.userId))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });

      return {
        success: true,
        message: input.makeAdmin
          ? "Admin role granted successfully"
          : "Admin role removed successfully",
        user: updatedUser,
      };
    } catch (err) {
      console.error("Error in toggleAdminRole:", err);
      throw err;
    }
  });

// Ban/unban user
export const toggleUserBan = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      banned: z.boolean(),
      banReason: z.string().optional(),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    // Check if user is admin
    const currentUser = context.session?.user as { role?: string } | undefined;
    if (!currentUser) throw new Error("Unauthorized");

    const roles = (currentUser.role ?? "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    if (!roles.includes("admin")) {
      throw new Error("Admin access required");
    }

    try {
      await db
        .update(user)
        .set({
          banned: input.banned,
          banReason: input.banned ? input.banReason : null,
          banExpires: null, // You can extend this to support temporary bans
          updatedAt: new Date(),
        })
        .where(eq(user.id, input.userId));

      return {
        success: true,
        message: input.banned
          ? "User banned successfully"
          : "User unbanned successfully",
      };
    } catch (err) {
      console.error("Error in toggleUserBan:", err);
      throw err;
    }
  });

export const adminRoute = {
  getAllUsers,
  toggleAdminRole,
  toggleUserBan,
};
