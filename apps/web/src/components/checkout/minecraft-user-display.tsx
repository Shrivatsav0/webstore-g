"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Edit3,
  CheckCircle,
  AlertCircle,
  Plus,
  UserX,
} from "lucide-react";
import { useMinecraftUser } from "@/hooks/use-minecraft-user";
import { MinecraftUsernameModal } from "../minecraft/minecraft-username-modal";
import { useCartStore } from "../../../stores/cart";
import { cn } from "@/lib/utils";

interface MinecraftUserDisplayProps {
  showForEmptyCart?: boolean;
  compact?: boolean;
}

export function MinecraftUserDisplay({
  showForEmptyCart = false,
  compact = false,
}: MinecraftUserDisplayProps) {
  const { sessionId } = useCartStore();
  const { mcUser, hasUsername, isValid, validation } = useMinecraftUser();
  const [showEditModal, setShowEditModal] = React.useState(false);

  // Show add username prompt when cart is empty or no username is set
  if (!hasUsername) {
    return (
      <>
        <Card
          className={cn(
            "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950",
            compact && "border-dashed"
          )}
        >
          <CardContent className={cn("p-4", compact && "p-3")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                  <UserX className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Minecraft Username Required
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {showForEmptyCart
                      ? "Set your username to start shopping"
                      : "Required for checkout"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Username
              </Button>
            </div>
          </CardContent>
        </Card>

        <MinecraftUsernameModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          sessionId={sessionId || ""}
          currentUsername={mcUser?.minecraftUsername}
        />
      </>
    );
  }

  // Show validation status for existing username
  const isValidUsername = validation?.isValid ?? false;
  const validationMessage = "Username is invalid";

  return (
    <>
      <Card
        className={cn(
          isValidUsername
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
          compact && "border-0 bg-transparent dark:bg-transparent"
        )}
      >
        <CardContent className={cn("p-4", compact && "p-0")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  isValidUsername
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-red-100 dark:bg-red-900"
                )}
              >
                <User
                  className={cn(
                    "h-5 w-5",
                    isValidUsername
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p
                    className={cn(
                      "font-medium",
                      isValidUsername
                        ? "text-green-900 dark:text-green-100"
                        : "text-red-900 dark:text-red-100"
                    )}
                  >
                    Minecraft Username
                  </p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      isValidUsername
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    )}
                  >
                    {isValidUsername ? (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Invalid
                      </>
                    )}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p
                    className={cn(
                      "font-mono text-sm truncate",
                      isValidUsername
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    )}
                  >
                    {mcUser?.minecraftUsername}
                  </p>
                  {!isValidUsername && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {validationMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {!compact && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className={cn(
                  "shrink-0 ml-2",
                  isValidUsername
                    ? "border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
                    : "border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                )}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>

          {compact && (
            <div className="mt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className={cn(
                  "text-xs h-7",
                  isValidUsername
                    ? "text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-900"
                    : "text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900"
                )}
              >
                <Edit3 className="mr-1 h-3 w-3" />
                Change
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <MinecraftUsernameModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        sessionId={sessionId || ""}
        currentUsername={mcUser?.minecraftUsername}
      />
    </>
  );
}
