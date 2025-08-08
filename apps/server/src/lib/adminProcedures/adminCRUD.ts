import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "../orpc";

export const adminProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const user = context.session?.user as
      | ({ role: string } & typeof context.session.user)
      | undefined;

    const roles = user?.role?.split(",") ?? [];

    if (!roles.includes("admin")) {
      console.log("Not authorized", user?.role);
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have admin privileges to perform this action.",
      });
    }

    return next();
  }
);
