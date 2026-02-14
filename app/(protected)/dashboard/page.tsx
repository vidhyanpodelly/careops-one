"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { workspaceId, loading } = useAuth();

  const [leads, setLeads] = useState<any[]>(([]));
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "leads"),
          where("workspaceId", "==", workspaceId)
        );

        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLeads(data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [workspaceId]);

  if (loading || loadingData) return <p className="p-10">Loading dashboard...</p>;

  // ===== METRICS =====

  const totalLeads = leads.length;

  const pendingLeads = leads.filter((l) => l.status === "lead").length;

  const bookedLeads = leads.filter((l) => l.status === "booked").length;

  const completedLeads = leads.filter((l) => l.status === "completed").length;

  const conversionRate =
    totalLeads === 0
      ? 0
      : ((completedLeads / totalLeads) * 100).toFixed(1);

  // Risk: booked but not completed
  const atRisk = leads.filter(
    (l) => l.status === "booked"
  ).length;

  // ===== UI =====

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8">Operational Dashboard</h1>

      {/* Funnel metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-xl font-bold">{totalLeads}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-xl font-bold">{pendingLeads}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Booked</p>
          <p className="text-xl font-bold">{bookedLeads}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-xl font-bold">{completedLeads}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Conversion</p>
          <p className="text-xl font-bold">{conversionRate}%</p>
        </div>
      </div>

      {/* Risk indicator */}
      {atRisk > 0 && (
        <div className="mt-6 bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded">
          <p className="font-semibold">
            ⚠ {atRisk} bookings are pending completion
          </p>
        </div>
      )}

      {/* Empty state */}
      {totalLeads === 0 && (
        <div className="mt-6 text-gray-500">
          No leads yet. Share your public booking link to start.
        </div>
)}

        
<div className="bg-white p-6 rounded shadow mb-6">
  <h2 className="text-lg font-semibold mb-2">
    Public Contact Form
  </h2>

  <p className="text-sm text-gray-600 mb-3">
    Share this link with your customers so they can request services.
  </p>

  <input
    readOnly
    value={`${window.location.origin}/public/contact/${workspaceId}`}
    className="border p-2 w-full rounded mb-3"
  />

  <div className="flex gap-2">
    <button
      onClick={() => {
        navigator.clipboard.writeText(
          `${window.location.origin}/public/contact/${workspaceId}`
        );
        alert("Link copied!");
      }}
      className="bg-blue-600 text-white px-3 py-2 rounded"
    >
      Copy Link
    </button>

    <button
      onClick={() =>
        window.open(
          `/public/contact/${workspaceId}`,
          "_blank"
        )
      }
      className="bg-green-600 text-white px-3 py-2 rounded"
    >
      Open Form
    </button>
  </div>
</div>


      
    </div>
  );
}
