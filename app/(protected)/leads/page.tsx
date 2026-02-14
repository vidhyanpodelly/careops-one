"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function LeadsPage() {
  const { workspaceId, role, loading } = useAuth();

  const [leads, setLeads] = useState<any[]>([]);
  const [bookingInput, setBookingInput] = useState<{ [key: string]: string }>({});

  // 🔥 Fetch leads
  useEffect(() => {
    if (!workspaceId) return;

    const fetchLeads = async () => {
      const q = query(
        collection(db, "leads"),
        where("workspaceId", "==", workspaceId)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setLeads(data);
    };

    fetchLeads();
  }, [workspaceId]);

  // 🔥 Schedule booking
  const scheduleBooking = async (lead: any) => {
    const date = bookingInput[lead.id];

    if (!date) {
      alert("Please select booking date");
      return;
    }

    await updateDoc(doc(db, "leads", lead.id), {
      status: "booked",
      bookingDate: date,
    });

    // instant UI refresh
    setLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id ? { ...l, status: "booked" } : l
      )
    );
  };

  // 🔥 Mark completed (OWNER only)
  const markCompleted = async (lead: any) => {
    if (role !== "OWNER") {
      alert("Only owner can complete");
      return;
    }

    if (lead.status !== "booked") {
      alert("Booking must be scheduled first");
      return;
    }

    await updateDoc(doc(db, "leads", lead.id), {
      status: "completed",
    });

    setLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id ? { ...l, status: "completed" } : l
      )
    );
  };

if (loading || !workspaceId) {
  return <p className="p-10">Loading dashboard...</p>;
}


  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Leads</h1>

      {leads.length === 0 && (
        <p className="text-gray-500">No leads yet</p>
      )}

      {leads.map((lead) => (
        <div key={lead.id} className="bg-white p-4 rounded shadow mb-4">
          <h3 className="font-bold">{lead.name}</h3>
          <p>{lead.email}</p>

          <p className="mt-2">
            Status:
            <span className="font-semibold ml-2">
              {lead.status?.toUpperCase()}
            </span>
          </p>

          {/* ===== LEAD STAGE ===== */}
          {lead.status === "lead" && (
            <div className="mt-3">
              <div className="grid grid-cols-4 gap-2 mt-2">
  {[
    "9:00 AM", "10:00 AM", "11:00 AM",
    "1:00 PM", "2:00 PM", "3:00 PM"
  ].map((slot) => (
    <button
      key={slot}
      onClick={() =>
        setBookingInput((prev) => ({
          ...prev,
          [lead.id]: slot,
        }))
      }
      className={`p-2 border rounded ${
        bookingInput[lead.id] === slot
          ? "bg-blue-600 text-white"
          : ""
      }`}
    >
      {slot}
    </button>
  ))}
</div>


              <button
                onClick={() => scheduleBooking(lead)}
                className="ml-2 bg-green-600 text-white px-3 py-1 rounded"
              >
                Schedule Booking
              </button>
            </div>
          )}

          {/* ===== BOOKED ===== */}
          {lead.status === "booked" && (
            <div className="mt-3">
              <p className="text-green-600 font-semibold">
                Booking Scheduled
              </p>

              {role === "OWNER" && (
                <button
                  onClick={() => markCompleted(lead)}
                  className="bg-blue-700 text-white px-3 py-1 rounded mt-2"
                >
                  Mark Completed
                </button>
              )}
            </div>
          )}

          {/* ===== COMPLETED ===== */}
          {lead.status === "completed" && (
            <p className="mt-2 text-blue-700 font-semibold">
              Completed
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
