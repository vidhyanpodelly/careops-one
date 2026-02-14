"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import emailjs from "@emailjs/browser";

export default function PublicContactPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [services, setServices] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchServices = async () => {
      const q = query(
        collection(db, "services"),
        where("workspaceId", "==", workspaceId)
      );

      const snap = await getDocs(q);
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    fetchServices();
  }, [workspaceId]);

  const submitLead = async () => {
    try {
      if (!name || !email || !selectedService) {
        alert("Fill required fields");
        return;
      }

      const service = services.find((s) => s.id === selectedService);

      // 🔥 1. Save lead
      await addDoc(collection(db, "leads"), {
        name,
        email,
        serviceId: selectedService,
        serviceName: service?.name,
        message,
        workspaceId,
        status: "lead",
        createdAt: new Date(),
      });

      // 🔥 2. Send email
      await emailjs.send(
        "service_2nyf2m1",
        "template_qz7q43n",
        {
          name,
          email,
          service: service?.name,
          message,
        },
        "szHUe20UJjLpYftHK"
      );

      // 🔥 3. Thank you UI
      setSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }
  };

  // 🔥 Success screen
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold text-green-600">
            Thank you!
          </h2>
          <p>We will contact you shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Book Service</h1>

      <input
        placeholder="Name"
        className="border p-2 w-full mb-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Email"
        className="border p-2 w-full mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-2"
        value={selectedService}
        onChange={(e) => setSelectedService(e.target.value)}
      >
        <option value="">Select Service</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <textarea
        className="border p-2 w-full mb-2"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={submitLead}
        className="bg-blue-600 text-white px-4 py-2 w-full"
      >
        Submit
      </button>
    </div>
  );
}
