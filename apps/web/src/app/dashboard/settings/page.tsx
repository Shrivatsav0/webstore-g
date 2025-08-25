// app/dashboard/settings/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  ShieldCheck,
  Ban,
  UserCheck,
  AlertTriangle,
  Users,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/sidebar/site-header";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  createdAt: Date;
  banned: boolean | null;
}

interface ToggleAdminResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string | null;
  };
}

interface ToggleBanResponse {
  success: boolean;
  message: string;
}

export default function SettingsPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"admin" | "ban" | null>(null);
  const [banReason, setBanReason] = useState("");
  const queryClient = useQueryClient();

  // Fetch all users
  const users = useQuery({
    ...orpc.admin.getAllUsers.queryOptions(),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  // Toggle admin role mutation
  const toggleAdminMutation = useMutation(
    orpc.admin.toggleAdminRole.mutationOptions({
      onSuccess: (data: any) => {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["admin", "getAllUsers"] });
        setSelectedUser(null);
        setActionType(null);
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to update admin role");
      },
    })
  );

  // Toggle ban mutation
  const toggleBanMutation = useMutation(
    orpc.admin.toggleUserBan.mutationOptions({
      onSuccess: (data: any) => {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["admin", "getAllUsers"] });
        setSelectedUser(null);
        setActionType(null);
        setBanReason("");
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to update ban status");
      },
    })
  );

  const handleAdminToggle = (user: User, makeAdmin: boolean) => {
    if (makeAdmin) {
      setSelectedUser(user);
      setActionType("admin");
    } else {
      // For admin removal, execute immediately
      toggleAdminMutation.mutate({
        userId: user.id,
        makeAdmin: false,
      });
    }
  };

  const handleBanToggle = (user: User, banned: boolean) => {
    if (banned) {
      setSelectedUser(user);
      setActionType("ban");
    } else {
      // Unban immediately
      toggleBanMutation.mutate({
        userId: user.id,
        banned: false,
      });
    }
  };

  const confirmAction = () => {
    if (!selectedUser || !actionType) return;

    if (actionType === "admin") {
      toggleAdminMutation.mutate({
        userId: selectedUser.id,
        makeAdmin: true,
      });
    } else if (actionType === "ban") {
      toggleBanMutation.mutate({
        userId: selectedUser.id,
        banned: true,
        banReason: banReason.trim() || undefined,
      });
    }
  };

  const getUserRoles = (roleString: string | null) => {
    if (!roleString) return [];
    return roleString
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
  };

  const isAdmin = (roleString: string | null) => {
    return getUserRoles(roleString).includes("admin");
  };

  return (
    <>
      <SiteHeader title="Settings" />
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="size-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Admin Settings</h1>
                <p className="text-muted-foreground">
                  Manage user roles and permissions
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {users.isLoading && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" />
                  Loading Users
                </CardTitle>
                <CardDescription>
                  Fetching user data, please wait...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded bg-muted"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {users.error && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-5" />
                  Error Loading Users
                </CardTitle>
                <CardDescription>
                  {users.error.message || "Failed to load users"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => users.refetch()} variant="outline">
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Users Table */}
          {users.data && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage admin roles and user access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.data.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {user.name || "Unnamed User"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {getUserRoles(user.role).map((role) => (
                                <Badge
                                  key={role}
                                  variant={
                                    role === "admin" ? "default" : "secondary"
                                  }
                                >
                                  {role}
                                </Badge>
                              ))}
                              {getUserRoles(user.role).length === 0 && (
                                <Badge variant="outline">user</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.banned ? (
                              <Badge variant="destructive">Banned</Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-green-600"
                              >
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {isAdmin(user.role) ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAdminToggle(user, false)}
                                  disabled={toggleAdminMutation.isPending}
                                >
                                  <Shield className="size-4 mr-1" />
                                  Remove Admin
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleAdminToggle(user, true)}
                                  disabled={toggleAdminMutation.isPending}
                                >
                                  <ShieldCheck className="size-4 mr-1" />
                                  Make Admin
                                </Button>
                              )}

                              {user.banned ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBanToggle(user, false)}
                                  disabled={toggleBanMutation.isPending}
                                >
                                  <UserCheck className="size-4 mr-1" />
                                  Unban
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleBanToggle(user, true)}
                                  disabled={toggleBanMutation.isPending}
                                >
                                  <Ban className="size-4 mr-1" />
                                  Ban
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmation Dialogs */}
          <AlertDialog
            open={actionType === "admin" && !!selectedUser}
            onOpenChange={() => {
              setSelectedUser(null);
              setActionType(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Grant Admin Access</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to grant admin privileges to{" "}
                  <strong>{selectedUser?.name || selectedUser?.email}</strong>?
                  This will give them full access to admin features.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmAction}>
                  Grant Admin Access
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog
            open={actionType === "ban" && !!selectedUser}
            onOpenChange={() => {
              setSelectedUser(null);
              setActionType(null);
              setBanReason("");
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ban User</DialogTitle>
                <DialogDescription>
                  You are about to ban{" "}
                  <strong>{selectedUser?.name || selectedUser?.email}</strong>.
                  Please provide a reason for the ban.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="banReason">Ban Reason</Label>
                  <Textarea
                    id="banReason"
                    placeholder="Enter reason for ban..."
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(null);
                    setActionType(null);
                    setBanReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmAction}
                  disabled={toggleBanMutation.isPending}
                >
                  Ban User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </>
  );
}
