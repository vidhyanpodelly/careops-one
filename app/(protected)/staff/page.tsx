"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function StaffPage() {
  const { workspaceId, role } = useAuth();

  const [staffList, setStaffList] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    fetchStaff();
  }, [workspaceId]);

  const fetchStaff = async () => {
    const q = query(
      collection(db, "staff"),
      where("workspaceId", "==", workspaceId)
    );

    const snap = await getDocs(q);

    setStaffList(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    );
  };

  // 🔥 Add staff
  const addStaff = async () => {
    if (!email || !name) {
      alert("Enter name and email");
      return;
    }

    await addDoc(collection(db, "staff"), {
      name,
      email,
      role: "STAFF",
      workspaceId,
      createdAt: new Date(),
    });

    setEmail("");
    setName("");
    fetchStaff();
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Staff Management</h1>

      {/* Owner only */}
      {role === "OWNER" && (
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="font-semibold mb-4">Add Staff</h2>

          <input
            placeholder="Name"
            className="border p-2 w-full mb-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Email"
            className="border p-2 w-full mb-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={addStaff}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Staff
          </button>
        </div>
      )}

      {/* Staff List */}
      <div>
        <h2 className="font-semibold mb-4">Team Members</h2>

        {staffList.length === 0 && (
          <p className="text-gray-500">No staff added</p>
        )}

        {staffList.map((staff) => (
          <div
            key={staff.id}
            className="bg-white p-4 rounded shadow mb-3"
          >
            <p className="font-bold">{staff.name}</p>
            <p>{staff.email}</p>
            <p className="text-sm text-gray-500">
              Role: {staff.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
