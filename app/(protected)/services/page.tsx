"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
}

export default function ServicesPage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [serviceName, setServiceName] = useState("");
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});

  // 🔥 Detect OWNER or STAFF
  useEffect(() => {
    const staff = localStorage.getItem("staffSession");

    if (staff) {
      const parsed = JSON.parse(staff);
      setWorkspaceId(parsed.workspaceId);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      setWorkspaceId(userDoc.data()?.workspaceId);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    fetchInventory();
  }, [workspaceId]);

  const fetchInventory = async () => {
    const q = query(
      collection(db, "inventory"),
      where("workspaceId", "==", workspaceId)
    );
    const snapshot = await getDocs(q);
    setInventory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryItem[]);
  };

  const createService = async () => {
    if (!workspaceId) return;

    const requiredInventory = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({
        itemId,
        quantityRequired: qty,
      }));

    if (!serviceName || requiredInventory.length === 0) {
      alert("Add service name and inventory");
      return;
    }

    await addDoc(collection(db, "services"), {
      name: serviceName,
      requiredInventory,
      workspaceId,
      createdAt: new Date(),
    });

    setServiceName("");
    setSelectedItems({});
    alert("Service Created");
  };

  if (!workspaceId) return <p className="p-10">Loading...</p>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Create Service</h1>

      <input
        className="border p-2 w-full rounded mb-4"
        placeholder="Service Name"
        value={serviceName}
        onChange={(e) => setServiceName(e.target.value)}
      />

      {inventory.map(item => (
        <div key={item.id} className="flex gap-4 mb-2">
          <span className="w-40">{item.name}</span>
          <input
            type="number"
            min="0"
            className="border p-2 w-20 rounded"
            value={selectedItems[item.id] || ""}
            onChange={(e) =>
              setSelectedItems(prev => ({
                ...prev,
                [item.id]: Number(e.target.value),
              }))
            }
          />
        </div>
      ))}

      <button
        onClick={createService}
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
      >
        Save Service
      </button>
    </div>
  );
}
