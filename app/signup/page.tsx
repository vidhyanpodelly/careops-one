"use client";

import { useState } from "react";
import { signup } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    try {
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      // 🔥 Create workspace linked to user
      const workspaceId = user.uid;

      await setDoc(doc(db, "workspaces", workspaceId), {
        ownerId: user.uid,
        createdAt: new Date(),
        active: false,
      });

      // 🔥 Save user profile
      await setDoc(doc(db, "users", user.uid), {
        email,
        role: "OWNER",
        workspaceId,
      });

      router.push("/setup");

    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4">Signup</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-3"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Create Workspace
        </button>
      </div>
    </div>
  );
}
