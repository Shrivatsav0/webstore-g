import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL || "");

export function products(products: any) {
  throw new Error("Function not implemented.");
}

export function categories(categories: any) {
  throw new Error("Function not implemented.");
}

export function categoryProducts(categoryProducts: any) {
  throw new Error("Function not implemented.");
}

export function categorySections(categorySections: any) {
  throw new Error("Function not implemented.");
}

export function categorySectionProducts(categorySectionProducts: any) {
  throw new Error("Function not implemented.");
}

export function categoryItems(categoryItems: any) {
  throw new Error("Function not implemented.");
}

export function testimonials(testimonials: any) {
  throw new Error("Function not implemented.");
}

export function stats(stats: any) {
  throw new Error("Function not implemented.");
}

export function features(features: any) {
  throw new Error("Function not implemented.");
}

export function siteConfig(siteConfig: any) {
  throw new Error("Function not implemented.");
}

export function heroData(heroData: any) {
  throw new Error("Function not implemented.");
}

export function newsletter(newsletter: any) {
  throw new Error("Function not implemented.");
}

export function footerSections(footerSections: any) {
  throw new Error("Function not implemented.");
}

export function footerLinks(footerLinks: any) {
  throw new Error("Function not implemented.");
}

export function userMenuItems(userMenuItems: any) {
  throw new Error("Function not implemented.");
}
