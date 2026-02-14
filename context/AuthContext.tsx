"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AuthState {
  workspaceId: string | null;
  role: string | null;
  email: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  workspaceId: null,
  role: null,
  email: null,
  loading: true,
});

export function AuthProvider({ children }: any) {
  const [state, setState] = useState<AuthState>({
    workspaceId: null,
    role: null,
    email: null,
    loading: true,
  });

  useEffect(() => {
    // 🔥 STAFF LOGIN
    const staffSession = localStorage.getItem("staffSession");

    if (staffSession) {
      const parsed = JSON.parse(staffSession);

      setState({
        workspaceId: parsed.workspaceId,
        role: "STAFF",
        email: parsed.email,
        loading: false,
      });

      return;
    }

    // 🔥 OWNER LOGIN
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ workspaceId: null, role: null, email: null, loading: false });
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();

        setState({
          workspaceId: data.workspaceId,
          role: data.role,
          email: user.email,
          loading: false,
        });
      }
    });

    return () => unsub();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
