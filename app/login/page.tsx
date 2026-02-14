"use client";

import { useState } from "react";
import { login } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email) {
      alert("Enter email");
      return;
    }

    // ---------- OWNER LOGIN ----------
    if (password) {
      try {
        const userCredential = await login(email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data();

        if (data?.role === "OWNER") {
          router.push("/dashboard");
          return;
        }
      } catch (err) {
        console.log("Owner login failed, checking staff...");
      }
    }

    // ---------- STAFF LOGIN ----------
    const q = query(
      collection(db, "staff"),
      where("email", "==", email)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const staffData = snapshot.docs[0].data();

      // store staff session locally
      localStorage.setItem(
        "staffSession",
        JSON.stringify({
          email,
          workspaceId: staffData.workspaceId,
          role: "staff",
        })
      );

      router.push("/dashboard");
      return;
    }

    alert("Invalid credentials or staff not found");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-80">

        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-3"
          placeholder="Password (only for owner)"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
