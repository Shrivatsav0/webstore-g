"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Image from "next/image";

// Utility: sanitize filename
function slugifyFilename(filename: string): string {
  return filename
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  folder?: string;
}

export const ImageUpload = ({
  value,
  onChange,
  onRemove,
  disabled = false,
  folder = "categories-products",
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  // Upload mutation
  const uploadImageMutation = useMutation(
    orpc.images.upload.mutationOptions({
      onSuccess: (data) => {
        onChange(data.url);
        setIsUploading(false);
      },
      onError: (error) => {
        console.error("Failed to upload image:", error);
        alert("Failed to upload image. Please try again.");
        setIsUploading(false);
      },
    })
  );

  // Delete mutation
  const deleteImageMutation = useMutation(
    orpc.images.delete.mutationOptions({
      onSuccess: () => {
        if (onRemove) onRemove();
      },
      onError: (error) => {
        console.error("Failed to delete image:", error);
        alert("Failed to delete image. Please try again.");
      },
    })
  );

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const base64 = await fileToBase64(file);

      // ✅ sanitize filename
      const rawName = file.name.split(".")[0];
      const safeName = slugifyFilename(rawName);

      uploadImageMutation.mutate({
        file: base64,
        folder,
        filename: safeName,
      });
    } catch (error) {
      console.error("Error converting file to base64:", error);
      alert("Failed to process image");
      setIsUploading(false);
    }

    event.target.value = "";
  };

  const handleRemove = () => {
    if (value) {
      const urlParts = value.split("/");
      const publicIdWithExtension = urlParts.slice(-2).join("/");
      const publicId = publicIdWithExtension.split(".")[0];

      deleteImageMutation.mutate({ public_id: publicId });
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={disabled || deleteImageMutation.isPending}
          >
            {deleteImageMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <X className="size-4" />
            )}
          </Button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading || uploadImageMutation.isPending}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full h-48 border-dashed border-2 hover:border-primary/50 transition-colors"
            disabled={disabled || isUploading || uploadImageMutation.isPending}
          >
            <div className="flex flex-col items-center gap-2">
              {isUploading || uploadImageMutation.isPending ? (
                <>
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Uploading...
                  </span>
                </>
              ) : (
                <>
                  <Upload className="size-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload image
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 5MB
                  </span>
                </>
              )}
            </div>
          </Button>
        </div>
      )}
    </div>
  );
};
