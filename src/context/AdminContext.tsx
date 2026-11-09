"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "SUPPORT_AGENT" | "FINANCE_ADMIN";

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  badgeNumber: string;
  sessionToken: string;
  loginTime: string;
}

const DEFAULT_SUPER_ADMIN: AdminSession = {
  id: "adm_kasun_001",
  name: "Kasun Jayasuriya",
  email: "admin.director@bidme.lk",
  role: "SUPER_ADMIN",
  badgeNumber: "BDME-SEC-001",
  sessionToken: "tok_sec_vault_889104",
  loginTime: new Date().toISOString(),
};

interface AdminContextType {
  admin: AdminSession | null;
  role: AdminRole;
  isAuthenticated: boolean;
  login: (role: AdminRole) => void;
  logout: () => void;
  switchRole: (newRole: AdminRole) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bidme_admin_session") || localStorage.getItem("bitme_admin_session");
      if (saved) {
        setAdmin(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = (selectedRole: AdminRole = "SUPER_ADMIN") => {
    const session: AdminSession = {
      ...DEFAULT_SUPER_ADMIN,
      role: selectedRole,
      loginTime: new Date().toISOString(),
    };
    setAdmin(session);
    try {
      localStorage.setItem("bidme_admin_session", JSON.stringify(session));
      localStorage.setItem("bitme_admin_session", JSON.stringify(session));
    } catch (e) {}
  };

  const logout = () => {
    setAdmin(null);
    try {
      localStorage.removeItem("bidme_admin_session");
      localStorage.removeItem("bitme_admin_session");
    } catch (e) {}
    router.push("/admin/login");
  };

  const switchRole = (newRole: AdminRole) => {
    if (!admin) return;
    const updated = { ...admin, role: newRole };
    setAdmin(updated);
    try {
      localStorage.setItem("bidme_admin_session", JSON.stringify(updated));
      localStorage.setItem("bitme_admin_session", JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        role: admin?.role || "SUPER_ADMIN",
        isAuthenticated: !!admin,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
