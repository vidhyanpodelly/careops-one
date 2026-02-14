"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function BookingsPage() {
  const { workspaceId } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchBookings = async () => {
      const q = query(
        collection(db, "leads"),
        where("workspaceId", "==", workspaceId),
        where("status", "==", "booked")
      );

      const snap = await getDocs(q);

      setBookings(snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })));
    };

    fetchBookings();
  }, [workspaceId]);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>

      {bookings.length === 0 && (
        <p className="text-gray-500">No bookings scheduled</p>
      )}

      {bookings.map((b) => (
        <div key={b.id} className="bg-white p-4 rounded shadow mb-4">
          <h3 className="font-bold">{b.name}</h3>
          <p>{b.email}</p>

          <p className="mt-2 text-green-600">
            Booking Date: {new Date(b.bookingDate).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
