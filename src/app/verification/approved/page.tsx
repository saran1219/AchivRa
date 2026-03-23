"use client";

import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Navbar, Sidebar } from "@/components/Layout";

export default function ApprovedPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        if (!db) {
          console.error("Firebase db is not initialized");
          return;
        }
        const q = query(
          collection(db, "achievements"),
          where("status", "==", "approved")
        );
        const snapshot = await getDocs(q);
        const result = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(result);
      } catch (error) {
        console.error("Approved fetch error:", error);
      }
    };
    fetchApproved();
  }, []);

  return (
    <>
      <Navbar />
      <Sidebar>
        <div className="p-6 text-[#001a4d]">
          <h1 className="text-xl font-semibold mb-4 text-white">Approved List</h1>
          {data.length === 0 ? (
            <p className="text-gray-200">No approved records</p>
          ) : (
            data.map(item => (
              <div key={item.id} className="p-4 border border-white/20 bg-white/95 rounded-xl shadow-sm mb-3 text-[#001a4d]">
                <p className="font-medium text-lg">{item.title || "Untitled"}</p>
                <p className="text-sm text-gray-500">{item.studentName}</p>
              </div>
            ))
          )}
        </div>
      </Sidebar>
    </>
  );
}
