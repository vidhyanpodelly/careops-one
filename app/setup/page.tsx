"use client";

import { useEffect, useState } from "react";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();

  const [workspace, setWorkspace] = useState<any>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [emailConnected, setEmailConnected] = useState(false);
  const [smsConnected, setSmsConnected] = useState(false);

  const [servicesCount, setServicesCount] = useState(0);
  const [inventoryCount, setInventoryCount] = useState(0);

  useEffect(() => {
    fetchWorkspace();
    fetchCounts();
  }, []);

  const fetchWorkspace = async () => {
    const snap = await getDoc(doc(db, "workspace", "main"));

    if (snap.exists()) {
      const data = snap.data();
      setWorkspace(data);

      // Prefill form
      setName(data.name || "");
      setAddress(data.address || "");
      setTimezone(data.timezone || "");
      setContactEmail(data.contactEmail || "");
      setEmailConnected(data.emailConnected || false);
      setSmsConnected(data.smsConnected || false);
    }
  };

  const fetchCounts = async () => {
    const servicesSnap = await getDocs(collection(db, "services"));
    const inventorySnap = await getDocs(collection(db, "inventory"));

    setServicesCount(servicesSnap.size);
    setInventoryCount(inventorySnap.size);
  };

  const saveConfiguration = async () => {
    if (!name || !address || !timezone || !contactEmail) {
      alert("Please fill all fields");
      return;
    }

    await setDoc(doc(db, "workspace", "main"), {
      name,
      address,
      timezone,
      contactEmail,
      emailConnected,
      smsConnected,
      active: false, // reset activation on save
      updatedAt: new Date(),
    });

    alert("Configuration Saved");
    fetchWorkspace();
  };

  const canActivate =
    (emailConnected || smsConnected) &&
    servicesCount > 0 &&
    inventoryCount > 0;

  const activateWorkspace = async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("User not logged in");
    return;
  }

  await updateDoc(doc(db, "workspaces", user.uid), {
    active: true,
  });

  router.push("/dashboard");
};

  return (
    <div className="p-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Workspace Setup</h1>

      <div className="space-y-4 bg-white p-6 rounded shadow">

        <input
          className="border p-2 w-full rounded"
          placeholder="Business Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Contact Email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />

        <div className="flex items-center space-x-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emailConnected}
              onChange={() => setEmailConnected(!emailConnected)}
            />
            Email Connected
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={smsConnected}
              onChange={() => setSmsConnected(!smsConnected)}
            />
            SMS Connected
          </label>
        </div>

        <button
          onClick={saveConfiguration}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Configuration
        </button>

        <div className="mt-6 border-t pt-4">
          <p>Services Configured: {servicesCount}</p>
          <p>Inventory Items: {inventoryCount}</p>

          <button
            disabled={!canActivate}
            onClick={activateWorkspace}
            className={`mt-4 px-4 py-2 rounded text-white ${
              canActivate
                ? "bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Activate Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
