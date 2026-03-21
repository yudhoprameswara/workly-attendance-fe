import { CalendarIcon, List } from "lucide-react";
import React, { useEffect, useState } from "react";
import "react-calendar/dist/Calendar.css";
import ListView from "../components/ListView";
import CalendarView from "../components/CalendarView";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";

const AttendanceHistory = () => {
  const [viewMode, setViewMode] = useState("list");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const userStore = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/attendance/user/${userStore?.id}`);
        setData(response.data);
      } catch (err) {
        console.error("Gagal tarik data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userStore?.id) fetchAttendance();
  }, [userStore?.id]);

  return (
    <div className="p-6 overflow-hidden"> 
      <div className="flex justify-between mb-6">
        <div className="flex bg-neutral-100 rounded-2xl p-1.5 shadow-inner">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ${
              viewMode === "list"
                ? "bg-white shadow-md text-blue-600 scale-[1.02]"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <List size={18} />
            <span className="font-bold text-sm">List</span>
          </button>

          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ${
              viewMode === "calendar"
                ? "bg-white shadow-md text-blue-600 scale-[1.02]"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <CalendarIcon size={18} />
            <span className="font-bold text-sm">Calendar</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait"> 
          <motion.div
            key={viewMode} 
            initial={{ opacity: 0, x: viewMode === "list" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: viewMode === "list" ? 20 : -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-pulse text-neutral-400 font-bold tracking-widest text-xs uppercase">
                  Memuat Riwayat...
                </div>
              </div>
            ) : viewMode === "list" ? (
              <ListView data={data} />
            ) : (
              <CalendarView data={data} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AttendanceHistory;