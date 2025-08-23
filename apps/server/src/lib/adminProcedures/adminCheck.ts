import z from "zod";
import { publicProcedure } from "../orpc";

export const checkAdminStatus = publicProcedure
  .output(
    z.object({
      isAdmin: z.boolean(),
    })
  )
  .handler(async ({ context }) => {
    const user = context.session?.user as { role?: string } | undefined;
    if (!user) return { isAdmin: false };

    const roles = (user.role ?? "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    return { isAdmin: roles.includes("admin") };
  });
