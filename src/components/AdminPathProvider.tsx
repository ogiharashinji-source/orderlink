"use client";
import { createContext, useContext } from "react";

const AdminPathContext = createContext("");

export function AdminPathProvider({
  adminPath,
  children,
}: {
  adminPath: string;
  children: React.ReactNode;
}) {
  return (
    <AdminPathContext.Provider value={adminPath}>
      {children}
    </AdminPathContext.Provider>
  );
}

export function useAdminPath() {
  return useContext(AdminPathContext);
}
