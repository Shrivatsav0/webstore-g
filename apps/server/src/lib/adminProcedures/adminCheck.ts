import z from "zod";
import { protectedProcedure } from "../orpc";

export const checkAdminStatus = protectedProcedure
  .output(
    z.object({
      isAdmin: z.boolean(),
    })
  )
  .handler(async ({ context }) => {
    try {
      // Check if user is authenticated
      if (!context.session?.user) {
        return { isAdmin: false };
      }

      const user = context.session.user as
        | ({ role: string } & typeof context.session.user)
        | undefined;

      // Parse roles the same way as your adminProcedure
      const roles = user?.role?.split(",") ?? [];
      const isAdmin = roles.includes("admin");

      return { isAdmin };
    } catch (error) {
      console.error("Error checking admin status:", error);
      return { isAdmin: false };
    }
  });
