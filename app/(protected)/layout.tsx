"use client";

import { AuthProvider } from "@/context/AuthContext";
import ProtectedSidebar from "./ProtectedSidebar";

export default function Layout({ children }: any) {
  return (
    <AuthProvider>
      <ProtectedSidebar>{children}</ProtectedSidebar>
    </AuthProvider>
  );
}
