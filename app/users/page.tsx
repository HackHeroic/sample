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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/wrappers/DashboardLayout";
import { User, Role } from "@/lib/types";
import {
  fetchUsers,
  fetchRoles,
  createUser,
  updateUser,
  deleteUser,
  fetchPermissions,
  createRole,
} from "@/lib/api";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import AccessDeniedCard from "@/components/AccessDeniedCard";
import { Label } from "@/components/ui/label";

export default function UsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [userEmail, setUserEmail] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("");
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
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

    const loadRoles = async () => {
      try {
        const data = await fetchRoles();
        setAvailableRoles(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
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
        user.permissions.includes("manage_users");
      setHasPermission(userHasPermission);
      if (userHasPermission) {
        loadUsers();
        loadRoles();
        loadPermissions();
      } else {
        setLoading(false);
      }
    }
  }, [user, toast]);

  const handleSaveUser = async () => {
    if (
      !userEmail.trim() ||
      !userFullName.trim() ||
      (dialogMode === "add" && !userPassword.trim()) ||
      !userRole
    ) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const userData = {
        email: userEmail,
        name: userFullName,
        role: userRole,
        ...(dialogMode === "add" || userPassword
          ? { password: userPassword }
          : {}),
      };

      if (dialogMode === "add") {
        await createUser(userData as any);
        const updatedUsers = await fetchUsers();
        setUsers(updatedUsers);
        toast({ title: "Success", description: "User added successfully" });
      } else if (selectedUser?.id) {
        await updateUser(selectedUser.id, userData);
        const updatedUsers = await fetchUsers();
        setUsers(updatedUsers);
        toast({ title: "Success", description: "User updated successfully" });
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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user.id !== userId));
      toast({ title: "Success", description: "User deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
        permissions: selectedPermissions.includes("all_permissions")
          ? ["all_permissions"]
          : selectedPermissions,
      };
      const newRole = await createRole(roleData);
      setAvailableRoles([...availableRoles, newRole]);
      toast({ title: "Success", description: "Role created successfully" });
      setIsRoleDialogOpen(false);
      setRoleName("");
      setSelectedPermissions([]);
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
    setUserEmail("");
    setUserFullName("");
    setUserPassword("");
    setUserRole("");
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setDialogMode("edit");
    setSelectedUser(user);
    setUserEmail(user.email);
    setUserFullName(user.name || user.fullName || "");
    setUserPassword("");
    setUserRole(user.role || user.roles?.[0] || "");
    setIsDialogOpen(true);
  };

  const openViewDialog = (user: User) => {
    setViewedUser(user);
    setIsViewDialogOpen(true);
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setUserEmail("");
    setUserFullName("");
    setUserPassword("");
    setUserRole("");
    setSelectedUser(null);
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
    Object.keys(groups).forEach((group) => {
      groups[group].sort((a, b) => {
        const order = ["view", "create", "edit", "delete", "manage"];
        const aAction = a.split("_")[0];
        const bAction = b.split("_")[0];
        const aIndex =
          order.indexOf(aAction) !== -1 ? order.indexOf(aAction) : 999;
        const bIndex =
          order.indexOf(bAction) !== -1 ? order.indexOf(bAction) : 999;
        return aIndex - bIndex || a.localeCompare(b);
      });
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
      setSelectedPermissions(
        selectedPermissions.filter((p) => !groupPerms.includes(p))
      );
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
    return availablePermissions.every((perm) =>
      selectedPermissions.includes(perm)
    );
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">Manage system users</p>
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
            <h2 className="text-3xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">Manage system users</p>
          </div>
          <Button
            onClick={openAddDialog}
            className="bg-[#6B46C1] hover:bg-[#5a3aa3]"
          >
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden md:table-cell">ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Name
                      </TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Permissions
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer"
                        onClick={() => openViewDialog(user)}
                      >
                        <TableCell className="hidden md:table-cell font-medium">
                          {user.id}
                        </TableCell>
                        <TableCell className="max-w-[120px] truncate">
                          {user.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.name || user.fullName || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-[#6B46C1] text-white"
                          >
                            {user.role || user.roles?.[0] || "No Role"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="secondary">
                            {user.permissions.length} permissions
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
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

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetDialog();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "add" ? "Add New User" : "Edit User"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  placeholder="Email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="Full Name"
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                />
              </div>
              <div>
                <Label>
                  Password{" "}
                  {dialogMode === "edit" && "(leave empty to keep current)"}
                </Label>
                <Input
                  type="password"
                  placeholder="Password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label>Role</Label>
                  <Select value={userRole} onValueChange={setUserRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.name} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsRoleDialogOpen(true)}
                  className="mt-6 bg-[#6B46C1] hover:bg-[#5a3aa3]"
                >
                  + New Role
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSaveUser}
                className="bg-[#6B46C1] hover:bg-[#5a3aa3]"
              >
                {dialogMode === "add" ? "Save User" : "Update User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-[90vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View User</DialogTitle>
            </DialogHeader>
            {viewedUser && (
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">ID:</Label>
                  <p className="text-sm">{viewedUser.id || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Email:</Label>
                  <p className="text-sm">{viewedUser.email || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Name:</Label>
                  <p className="text-sm">
                    {viewedUser.name || viewedUser.fullName || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Role:</Label>
                  <p className="text-sm">
                    {viewedUser.role || viewedUser.roles?.[0] || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Permissions:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewedUser.permissions.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Role Name</Label>
              <Input
                placeholder="Role Name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="mb-4"
              />
            </div>
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">
                Permissions
              </Label>
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
                  <div
                    key={group}
                    className="border-b pb-2 mb-2 last:border-b-0"
                  >
                    <label className="flex items-center space-x-2 mb-1">
                      <Checkbox
                        checked={isGroupChecked(perms)}
                        onCheckedChange={(checked) =>
                          handleGroupCheckbox(perms, checked as boolean)
                        }
                      />
                      <span className="text-sm font-medium capitalize">
                        {group}
                      </span>
                    </label>
                    <div className="ml-6 flex flex-wrap gap-2">
                      {perms.map((perm) => (
                        <label
                          key={perm}
                          className="flex items-center space-x-2"
                        >
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
            <DialogFooter>
              <Button
                onClick={handleSaveRole}
                className="bg-[#6B46C1] hover:bg-[#5a3aa3]"
              >
                Save Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
