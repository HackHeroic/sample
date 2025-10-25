"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, AuthResponse } from "@/lib/types";
import { login as apiLogin, googleLogin as apiGoogleLogin } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ status: boolean; user?: User }>;
  googleLogin: (idToken: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await apiLogin({ email, password });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      router.push("/dashboard");
      return { status: true, user: response.user };
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (idToken: string) => {
    try {
      const response: AuthResponse = await apiGoogleLogin(idToken);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      router.push("/dashboard");
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return (
      user.permissions.includes("all_permissions") ||
      user.permissions.includes(permission)
    );
  };

  return (
    <AuthContext.Provider
      value={{ user, login, googleLogin, logout, isLoading, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
