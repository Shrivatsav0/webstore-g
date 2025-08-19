"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { User, UserX } from "lucide-react";
import { useMinecraftUser } from "@/hooks/use-minecraft-user";
import { MinecraftUsernameModal } from "../minecraft/minecraft-username-modal";
import { useCartStore } from "../../../stores/cart";
import { cn } from "@/lib/utils";

interface MinecraftAvatarButtonProps {
  size?: "sm" | "md" | "lg";
  showUsername?: boolean;
  className?: string;
}

export function MinecraftAvatarButton({
  size = "md",
  showUsername = true,
  className,
}: MinecraftAvatarButtonProps) {
  const { sessionId } = useCartStore();
  const { mcUser, hasUsername, isValid } = useMinecraftUser();
  const [showModal, setShowModal] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  // Size configurations
  const sizeConfig = {
    sm: {
      avatar: "h-6 w-6",
      button: "h-8 px-2 text-sm",
      gap: "gap-1.5",
    },
    md: {
      avatar: "h-8 w-8",
      button: "h-10 px-3 text-sm",
      gap: "gap-2",
    },
    lg: {
      avatar: "h-10 w-10",
      button: "h-12 px-4 text-base",
      gap: "gap-3",
    },
  };

  const config = sizeConfig[size];

  // Generate Minecraft head URL
  const getMinecraftHeadUrl = (username: string) => {
    // Using Crafatar API for Minecraft heads
    // Alternative APIs:
    // - `https://mc-heads.net/avatar/${username}/${size * 8}`
    // - `https://minotar.net/helm/${username}/${size * 8}`
    return `https://mc-heads.net/avatar/${username}/?size=${
      size === "sm" ? 32 : size === "md" ? 64 : 80
    }&overlay`;
  };

  // Reset image error when username changes
  React.useEffect(() => {
    if (mcUser?.minecraftUsername) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [mcUser?.minecraftUsername]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Render avatar or fallback
  const renderAvatar = () => {
    if (!hasUsername || !mcUser?.minecraftUsername) {
      return (
        <div
          className={cn(
            config.avatar,
            "rounded bg-muted flex items-center justify-center"
          )}
        >
          <UserX className="h-4 w-4 text-muted-foreground" />
        </div>
      );
    }

    if (imageError) {
      return (
        <div
          className={cn(
            config.avatar,
            "rounded bg-muted flex items-center justify-center"
          )}
        >
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      );
    }

    return (
      <div className={cn(config.avatar, "relative rounded overflow-hidden")}>
        {imageLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <Image
          src={getMinecraftHeadUrl(mcUser.minecraftUsername)}
          alt={`${mcUser.minecraftUsername}'s Minecraft head`}
          width={size === "sm" ? 24 : size === "md" ? 32 : 40}
          height={size === "sm" ? 24 : size === "md" ? 32 : 40}
          className={cn(
            "object-cover transition-opacity",
            imageLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          unoptimized // Since we're using external API
        />
      </div>
    );
  };

  // Button content based on state
  const getButtonContent = () => {
    if (!hasUsername) {
      return (
        <div className={cn("flex items-center", config.gap)}>
          {renderAvatar()}
          {showUsername && <span>Add Username</span>}
        </div>
      );
    }

    return (
      <div className={cn("flex items-center", config.gap)}>
        {renderAvatar()}
        {showUsername && (
          <div className="flex flex-col items-start min-w-0">
            <span
              className={cn(
                "font-mono truncate max-w-[120px]",
                !isValid && "text-destructive"
              )}
            >
              {mcUser?.minecraftUsername}
            </span>
            {!isValid && size !== "sm" && (
              <span className="text-xs text-destructive">Invalid</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          config.button,
          "justify-start",
          !isValid && hasUsername && "hover:bg-destructive/10",
          className
        )}
        onClick={() => setShowModal(true)}
      >
        {getButtonContent()}
      </Button>

      <MinecraftUsernameModal
        open={showModal}
        onOpenChange={setShowModal}
        sessionId={sessionId || ""}
        currentUsername={mcUser?.minecraftUsername}
      />
    </>
  );
}
