import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

export const adminProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const user = context.session?.user as
      | ({ role: string } & typeof context.session.user)
      | undefined;
    const roles = user?.role?.split(",") ?? [];
    if (!roles.includes("admin")) {
      throw new Error("Not authorized");
    }
    return next();
  }
);
