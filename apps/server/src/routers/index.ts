import { db } from "../db";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { user } from "../db/schema/auth";
import { checkAdminStatus } from "../lib/adminProcedures/adminCheck";
import { adminProcedure } from "../lib/adminProcedures/adminProcedure";
import { siteConfigRouter } from "../lib/adminProcedures/siteconfig";
import { heroConfigRoute } from "../lib/adminProcedures/heroConfig";
import { featuresConfigRoute } from "../lib/adminProcedures/feturesConfig";
import { categoriesRoute } from "../lib/adminProcedures/categories";
import { productsRoute } from "../lib/adminProcedures/products";
import { imagesRoute } from "../lib/procedures/cloudinary";
import { cartRoute } from "../lib/procedures/cart";
import { checkoutRoute } from "../lib/procedures/checkout";
import { mcUsersRoute } from "../lib/procedures/mcUsers";
import { supportRoute } from "../lib/adminProcedures/support";

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
  categories: categoriesRoute,
  products: productsRoute,
  images: imagesRoute,
  cart: cartRoute,
  checkout: checkoutRoute,
  mcUsers: mcUsersRoute,
  support: supportRoute,
  adminUsers: adminProcedure.handler(async () => {
    return db.select().from(user);
  }),
};
export type AppRouter = typeof appRouter;
