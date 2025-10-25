"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/wrappers/DashboardLayout";
import { Permission } from "@/lib/types";
import {
  createPermission,
  updatePermission,
  deletePermission,
} from "@/lib/api";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import AccessDeniedCard from "@/components/AccessDeniedCard";

export default function PermissionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [permissionName, setPermissionName] = useState("");
  const [permissionDescription, setPermissionDescription] = useState("");
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [viewedPermission, setViewedPermission] = useState<Permission | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/permissions`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setPermissions(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user && user.permissions) {
      const userHasPermission =
        user.permissions.includes("all_permissions") ||
        user.permissions.includes("manage_permissions");
      setHasPermission(userHasPermission);
      if (userHasPermission) {
        loadPermissions();
      } else {
        setLoading(false);
      }
    }
  }, [user, toast]);

  const handleSavePermission = async () => {
    if (permissionName.trim() === "") {
      toast({
        title: "Error",
        description: "Permission name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const permissionData = {
        name: permissionName,
        description: permissionDescription,
      };

      if (dialogMode === "add") {
        await createPermission(permissionData);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/permissions`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const updatedPermissions = await response.json();
        setPermissions(updatedPermissions);
        toast({ title: "Success", description: "Permission created successfully" });
      } else if (selectedPermission?.id) {
        await updatePermission(selectedPermission.id.toString(), permissionData);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/permissions`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const updatedPermissions = await response.json();
        setPermissions(updatedPermissions);
        toast({ title: "Success", description: "Permission updated successfully" });
      }
      resetDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePermission = async (permissionId: number) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;

    try {
      await deletePermission(permissionId.toString());
      setPermissions(permissions.filter((perm) => perm.id !== permissionId));
      toast({ title: "Success", description: "Permission deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => {
    setDialogMode("add");
    setPermissionName("");
    setPermissionDescription("");
    setSelectedPermission(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (permission: Permission) => {
    setDialogMode("edit");
    setSelectedPermission(permission);
    setPermissionName(permission.name);
    setPermissionDescription(permission.description || "");
    setIsDialogOpen(true);
  };

  const openViewDialog = (permission: Permission) => {
    setViewedPermission(permission);
    setIsViewDialogOpen(true);
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setPermissionName("");
    setPermissionDescription("");
    setSelectedPermission(null);
    setDialogMode("add");
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Permissions</h2>
            <p className="text-muted-foreground">Manage system permissions</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <SkeletonLoader />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasPermission) {
    return (
      <DashboardLayout>
        <AccessDeniedCard />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Permissions</h2>
            <p className="text-muted-foreground">Manage system permissions</p>
          </div>
          <Button onClick={openAddDialog} className="bg-[#6B46C1] hover:bg-[#5a3aa3]">
            Add Permission
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            {permissions.length === 0 ? (
              <p>No permissions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden md:table-cell">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow
                        key={permission.id}
                        className="cursor-pointer"
                        onClick={() => openViewDialog(permission)}
                      >
                        <TableCell className="hidden md:table-cell font-medium">
                          {permission.id}
                        </TableCell>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                          {permission.description || "-"}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(permission)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePermission(permission.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetDialog();
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "add" ? "Add New Permission" : "Edit Permission"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Permission Name</Label>
                <Input
                  placeholder="Permission Name"
                  value={permissionName}
                  onChange={(e) => setPermissionName(e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Permission Description"
                  value={permissionDescription}
                  onChange={(e) => setPermissionDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSavePermission} className="bg-[#6B46C1] hover:bg-[#5a3aa3]">
                {dialogMode === "add" ? "Save Permission" : "Update Permission"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>View Permission</DialogTitle>
            </DialogHeader>
            {viewedPermission && (
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">ID:</Label>
                  <p className="text-sm">{viewedPermission.id}</p>
                </div>
                <div>
                  <Label className="font-semibold">Name:</Label>
                  <p className="text-sm">{viewedPermission.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Description:</Label>
                  <p className="text-sm">{viewedPermission.description || "N/A"}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
