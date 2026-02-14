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
  id?: string;
  name: string;
  quantity: number;
  threshold: number;
}

export default function InventoryPage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [threshold, setThreshold] = useState("");

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
    setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryItem[]);
  };

  const addInventory = async () => {
    if (!name || !quantity || !threshold) return;

    await addDoc(collection(db, "inventory"), {
      name,
      quantity: Number(quantity),
      threshold: Number(threshold),
      workspaceId,
      createdAt: new Date(),
    });

    setName("");
    setQuantity("");
    setThreshold("");
    fetchInventory();
  };

  if (!workspaceId) return <p className="p-10">Loading...</p>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>

      <input
        placeholder="Item Name"
        className="border p-2 w-full mb-2 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Quantity"
        className="border p-2 w-full mb-2 rounded"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <input
        type="number"
        placeholder="Threshold"
        className="border p-2 w-full mb-2 rounded"
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
      />

      <button
        onClick={addInventory}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add Item
      </button>

      {items.map(item => (
        <div key={item.id} className="bg-white p-4 rounded shadow mt-2">
          <strong>{item.name}</strong>
          <p>Quantity: {item.quantity}</p>
          <p>Threshold: {item.threshold}</p>
        </div>
      ))}
    </div>
  );
}
