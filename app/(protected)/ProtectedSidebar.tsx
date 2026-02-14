"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Inbox,
  CalendarDays,
  ClipboardList,
  Package,
  Users
} from "lucide-react";


export default function ProtectedSidebar({ children }: any) {
  const { email, role } = useAuth();

  const logout = async () => {
    localStorage.removeItem("staffSession");
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">

        <p className="text-sm text-gray-400">Logged in as</p>
        <p className="font-semibold break-words">
          {email || "Loading..."}
        </p>

        <p className="text-sm text-gray-400 mt-3">Role</p>
        <p className="text-green-400 font-semibold">
          {role || "Loading..."}
        </p>

        {/* Navigation */}
        <div className="mt-6 space-y-2">

  <Link href="/dashboard" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
    <LayoutDashboard size={18} /> Dashboard
  </Link>

  <Link href="/leads" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
    <Inbox size={18} /> Leads
  </Link>

  <Link href="/bookings" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
    <CalendarDays size={18} /> Bookings
  </Link>

  <Link href="/inventory" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
    <Package size={18} /> Inventory
  </Link>

  <Link href="/services" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
    <ClipboardList size={18} /> Services
  </Link>

  <Link href="/staff" className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded">
    <Users size={18} /> Staff
  </Link>

</div>

        <button
          onClick={logout}
          className="mt-6 bg-red-500 px-3 py-2 w-full rounded hover:bg-red-600"
        >
          Logout
        </button>
      </aside>

      {/* Page content */}
      <main className="flex-1 bg-gray-100">{children}</main>
    </div>
  );
}
