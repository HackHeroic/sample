"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/wrappers/DashboardLayout";
import { Role } from "@/lib/types";
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchPermissions,
} from "@/lib/api";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import AccessDeniedCard from "@/components/AccessDeniedCard";

export default function RolesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [viewedRole, setViewedRole] = useState<Role | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await fetchRoles();
        setRoles(data);
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

    const loadPermissions = async () => {
      try {
        const permissions = await fetchPermissions();
        setAvailablePermissions(permissions);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    if (user && user.permissions) {
      const userHasPermission =
        user.permissions.includes("all_permissions") ||
        user.permissions.includes("manage_roles");
      setHasPermission(userHasPermission);
      if (userHasPermission) {
        loadRoles();
        loadPermissions();
      } else {
        setLoading(false);
      }
    }
  }, [user, toast]);

  const handleSaveRole = async () => {
    if (roleName.trim() === "" || selectedPermissions.length === 0) {
      toast({
        title: "Error",
        description: "Role name and at least one permission are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const roleData = {
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions,
      };

      if (dialogMode === "add") {
        await createRole(roleData);
        const updatedRoles = await fetchRoles();
        setRoles(updatedRoles);
        toast({ title: "Success", description: "Role created successfully" });
      } else if (selectedRole?.id) {
        await updateRole(selectedRole.id.toString(), roleData);
        const updatedRoles = await fetchRoles();
        setRoles(updatedRoles);
        toast({ title: "Success", description: "Role updated successfully" });
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

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      await deleteRole(roleId.toString());
      setRoles(roles.filter((role) => role.id !== roleId));
      toast({ title: "Success", description: "Role deleted successfully" });
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
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setSelectedRole(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setDialogMode("edit");
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setSelectedPermissions(role.permissions);
    setIsDialogOpen(true);
  };

  const openViewDialog = (role: Role) => {
    setViewedRole(role);
    setIsViewDialogOpen(true);
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setSelectedRole(null);
    setDialogMode("add");
  };

  const getPermissionGroups = () => {
    const groups: { [key: string]: string[] } = {};
    availablePermissions
      .filter((perm) => perm !== "all_permissions")
      .forEach((perm) => {
        const parts = perm.split("_");
        const entity = parts.slice(1).join("_");
        if (entity) {
          if (!groups[entity]) groups[entity] = [];
          groups[entity].push(perm);
        }
      });
    return groups;
  };

  const handlePermissionChange = (perm: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, perm]);
    } else {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    }
  };

  const handleGroupCheckbox = (groupPerms: string[], checked: boolean) => {
    if (checked) {
      const combined = [...selectedPermissions, ...groupPerms];
      const uniquePerms = Array.from(new Set(combined));
      setSelectedPermissions(uniquePerms);
    } else {
      setSelectedPermissions(selectedPermissions.filter((p) => !groupPerms.includes(p)));
    }
  };

  const handleAllPermissions = (checked: boolean) => {
    if (checked) {
      setSelectedPermissions(availablePermissions);
    } else {
      setSelectedPermissions([]);
    }
  };

  const isGroupChecked = (groupPerms: string[]) => {
    return groupPerms.every((perm) => selectedPermissions.includes(perm));
  };

  const isAllPermissionsChecked = () => {
    return availablePermissions.every((perm) => selectedPermissions.includes(perm));
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
            <p className="text-muted-foreground">Manage user roles</p>
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

  const permissionGroups = getPermissionGroups();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
            <p className="text-muted-foreground">Manage user roles</p>
          </div>
          <Button onClick={openAddDialog} className="bg-[#6B46C1] hover:bg-[#5a3aa3]">
            Add Role
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Roles</CardTitle>
          </CardHeader>
          <CardContent>
            {roles.length === 0 ? (
              <p>No roles found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden md:table-cell">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow
                        key={role.id}
                        className="cursor-pointer"
                        onClick={() => openViewDialog(role)}
                      >
                        <TableCell className="hidden md:table-cell font-medium">
                          {role.id}
                        </TableCell>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                          {role.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {role.permissions.length} permissions
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(role)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteRole(role.id)}
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
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "add" ? "Add New Role" : "Edit Role"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Role Name</Label>
                <Input
                  placeholder="Role Name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Role Description"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Permissions</Label>
                <div className="max-h-64 overflow-y-auto border rounded-md p-3">
                  <div className="border-b pb-2 mb-2">
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={isAllPermissionsChecked()}
                        onCheckedChange={(checked) =>
                          handleAllPermissions(checked as boolean)
                        }
                      />
                      <span className="text-sm font-medium">All Permissions</span>
                    </label>
                  </div>
                  {Object.entries(permissionGroups).map(([group, perms]) => (
                    <div key={group} className="border-b pb-2 mb-2 last:border-b-0">
                      <label className="flex items-center space-x-2 mb-1">
                        <Checkbox
                          checked={isGroupChecked(perms)}
                          onCheckedChange={(checked) =>
                            handleGroupCheckbox(perms, checked as boolean)
                          }
                        />
                        <span className="text-sm font-medium capitalize">{group}</span>
                      </label>
                      <div className="ml-6 flex flex-wrap gap-2">
                        {perms.map((perm) => (
                          <label key={perm} className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedPermissions.includes(perm)}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(perm, checked as boolean)
                              }
                            />
                            <span className="text-xs">{perm.split("_")[0]}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveRole} className="bg-[#6B46C1] hover:bg-[#5a3aa3]">
                {dialogMode === "add" ? "Save Role" : "Update Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-[90vw] sm:max-w-lg md:max-w-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Role</DialogTitle>
            </DialogHeader>
            {viewedRole && (
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">ID:</Label>
                  <p className="text-sm">{viewedRole.id}</p>
                </div>
                <div>
                  <Label className="font-semibold">Name:</Label>
                  <p className="text-sm">{viewedRole.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Description:</Label>
                  <p className="text-sm">{viewedRole.description || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Permissions:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewedRole.permissions.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
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
