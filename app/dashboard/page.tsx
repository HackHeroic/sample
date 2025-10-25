"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/wrappers/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, Shield, Key } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasPermission = (permission: string) => {
    return (
      user.permissions.includes("all_permissions") ||
      user.permissions.includes(permission)
    );
  };

  const managementLinks = [
    {
      title: "User Management",
      description: "Manage system users and their roles",
      href: "/users",
      icon: Users,
      permission: "manage_users",
    },
    {
      title: "Role Management",
      description: "Create and manage user roles",
      href: "/roles",
      icon: Shield,
      permission: "manage_roles",
    },
    {
      title: "Permission Management",
      description: "Define and manage permissions",
      href: "/permissions",
      icon: Key,
      permission: "manage_permissions",
    },
  ];

  const availableLinks = managementLinks.filter((link) =>
    hasPermission(link.permission)
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to Medifix-FSM
          </h2>
          <p className="text-muted-foreground mt-2">
            Hello, {user.name || user.email}! You are logged in as{" "}
            <span className="font-semibold">{user.role || user.roles?.[0]}</span>
          </p>
        </div>

        {availableLinks.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Management</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#6B46C1]">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {link.title}
                        </CardTitle>
                        <Icon className="h-5 w-5 text-[#6B46C1]" />
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          {link.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((permission) => (
                <span
                  key={permission}
                  className="px-3 py-1 bg-[#6B46C1] text-white text-xs rounded-full"
                >
                  {permission}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
