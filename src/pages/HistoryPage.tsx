import { CalendarIcon, List } from "lucide-react";
import React, { useEffect, useState } from "react";
import "react-calendar/dist/Calendar.css";
import ListView from "../components/ListView";
import CalendarView from "../components/CalendarView";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";

const AttendanceHistory = () => {
  const [viewMode, setViewMode] = useState("list");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userStore = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/attendance/user/${userStore?.id}`);
        console.log(response)
      
        setData(response.data); 
      } catch (err) {
        console.error("Gagal tarik data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              viewMode === "list"
                ? "bg-white shadow text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List size={18} />
            <span className="font-medium text-sm">List</span>
          </button>

          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              viewMode === "calendar"
                ? "bg-white shadow text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <CalendarIcon size={18} />
            <span className="font-medium text-sm">Calendar</span>
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <ListView data={data} />
      ) : (
        <CalendarView data={data} />
      )}
    </div>
  );
};

export default AttendanceHistory;
