import { db } from "../db";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { user } from "../db/schema/auth";
import { checkAdminStatus } from "../lib/adminProcedures/adminCheck";
import { adminProcedure } from "../lib/adminProcedures/adminProcedure";
import { siteConfigRouter } from "../lib/adminProcedures/siteconfig";
import { heroConfigRoute } from "../lib/adminProcedures/heroConfig";
import { featuresConfigRoute } from "../lib/adminProcedures/feturesConfig";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  users: publicProcedure.handler(async () => {
    return db.select().from(user);
  }),
  checkAdminStatus,
  siteConfig: siteConfigRouter,
  heroConfig: heroConfigRoute,
  featuresConfig: featuresConfigRoute,
  adminUsers: adminProcedure.handler(async () => {
    return db.select().from(user);
  }),
};
export type AppRouter = typeof appRouter;
