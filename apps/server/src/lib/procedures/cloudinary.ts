// procedures/images.ts
import { v2 as cloudinary } from "cloudinary";
import { os } from "@orpc/server";
import { z } from "zod";
import { adminProcedure } from "../adminProcedures/adminProcedure";

// Configure Cloudinary (server-side only)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility: sanitize filename into a safe slug
function slugifyFilename(filename: string): string {
  return filename
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-") // spaces → dashes
    .replace(/[^a-z0-9-_]/g, ""); // remove invalid chars
}

export const uploadImage = adminProcedure
  .input(
    z.object({
      file: z.string(), // base64 encoded file data
      folder: z.string().optional().default("categories-products"),
      filename: z.string().optional(), // optional public_id
    })
  )
  .handler(async ({ input }) => {
    try {
      console.log("uploadImage handler called");

      if (!input.file.startsWith("data:image/")) {
        throw new Error("Invalid file format. Only images are allowed.");
      }

      // ✅ sanitize filename if provided
      const safePublicId = input.filename
        ? slugifyFilename(input.filename)
        : undefined;

      const result = await cloudinary.uploader.upload(input.file, {
        folder: input.folder,
        public_id: safePublicId, // safe or undefined
        resource_type: "auto",
      });

      return {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (err) {
      console.error("Error in uploadImage:", err);
      throw new Error(
        err instanceof Error ? err.message : "Failed to upload image"
      );
    }
  });

export const deleteImage = adminProcedure
  .input(z.object({ public_id: z.string() }))
  .handler(async ({ input }) => {
    try {
      const result = await cloudinary.uploader.destroy(input.public_id);

      if (result.result !== "ok") {
        throw new Error("Failed to delete image from Cloudinary");
      }

      return { result: result.result, public_id: input.public_id };
    } catch (err) {
      console.error("Error in deleteImage:", err);
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete image"
      );
    }
  });

export const imagesRoute = {
  health: os.handler(async () => {
    return { status: cloudinary.config().cloud_name ? "ok" : "degraded" };
  }),
  upload: uploadImage,
  delete: deleteImage,
};
