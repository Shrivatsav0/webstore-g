"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, User, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";

interface MinecraftUsernameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  userId?: string;
  currentUsername?: string;
  onSuccess?: (username: string) => void;
}

export function MinecraftUsernameModal({
  open,
  onOpenChange,
  sessionId,
  userId,
  currentUsername,
  onSuccess,
}: MinecraftUsernameModalProps) {
  const [username, setUsername] = useState(currentUsername || "");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const setUsernameMutation = useMutation(
    orpc.mcUsers.setUsername.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["mcUser"] });
        toast.success("Minecraft username saved!");
        onSuccess?.(data.minecraftUsername);
        onOpenChange(false);
      },
      onError: (error) => {
        setError(error.message);
        toast.error("Failed to save username");
      },
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (username.length < 3 || username.length > 16) {
      setError("Username must be between 3 and 16 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    setUsernameMutation.mutate({
      sessionId,
      userId,
      minecraftUsername: username.trim(),
    });
  };

  const handleClose = () => {
    if (!setUsernameMutation.isPending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Minecraft Username Required
          </DialogTitle>
          <DialogDescription>
            Please enter your Minecraft username to continue with your purchase.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minecraft-username">Minecraft Username</Label>
            <Input
              id="minecraft-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your Minecraft username"
              disabled={setUsernameMutation.isPending}
              className="font-mono"
              maxLength={16}
            />
            <p className="text-xs text-muted-foreground">
              3-16 characters, letters, numbers, and underscores only
            </p>
          </div>

          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> Make sure this username matches your
              actual Minecraft account exactly. Items will be delivered to this
              username in-game.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={setUsernameMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={setUsernameMutation.isPending || !username.trim()}
            >
              {setUsernameMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Username
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
