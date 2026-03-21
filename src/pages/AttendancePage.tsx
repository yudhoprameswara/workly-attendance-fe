import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
} from "lucide-react";
import { adminService } from "../services/adminServices";
import AttendanceEditModal from "../components/AttendanceEditModal";
import AttendancePreviewModal from "../components/AttendancePreviewModal";
import api from "../api/axios";

const formatTime = (isoString: any) => {
  if (!isoString) return "--:--";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "--:--";

    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }).format(date);
  } catch (e) {
    return "--:--";
  }
};

const formatDate = (isoString: any) => {
  if (!isoString) return "--/--/----";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "--/--/----";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(date);
  } catch (e) {
    return "--/--/----";
  }
};

export interface AttendanceDetail {
  id: string;
  check_in_time: string;
  check_out_time: string;
  photo_url: string;
  photo_url_out?: string;
  location_in?: string;
  location_out?: string;
  status: string;
}

const AttendancePage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceDetail | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = async (id: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/attendance/${id}`);

      setSelectedAttendance(response.data);

      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Gagal mengambil detail absensi", error);
      alert("Gagal memuat detail data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllAttendance(
        currentPage,
        10,
        searchTerm,
        startDate,
        endDate,
      );
      setData(response.data);
      setTotalPages(response.meta.page);
      setTotalItems(response.meta.total);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, startDate, endDate]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAttendance();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [fetchAttendance]);

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const getAttendanceStatus = (checkInTime: string | null) => {
    if (!checkInTime)
      return {
        label: "Kosong",
        color: "gray",
        class: "bg-neutral-100 text-neutral-500",
      };

    const time = new Date(checkInTime);
    const formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });

    const parts = formatter.formatToParts(time);
    const hours = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
    const minutes = parseInt(
      parts.find((p) => p.type === "minute")?.value || "0",
    );

    const checkInTotalMinutes = hours * 60 + minutes;
    const targetInMinutes = 8 * 60 + 30;
    const toleranceInMinutes = targetInMinutes + 15;

    if (checkInTotalMinutes <= targetInMinutes) {
      return { label: "Tepat Waktu", class: "bg-emerald-100 text-emerald-700" };
    } else if (checkInTotalMinutes <= toleranceInMinutes) {
      return { label: "Toleransi", class: "bg-amber-100 text-amber-700" };
    } else {
      return { label: "Terlambat", class: "bg-red-100 text-red-700" };
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-neutral-800">
          Log Presensi Karyawan
        </h1>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Cari nama..."
              className="pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all w-64"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentPage(1);
                  fetchAttendance();
                }
              }}
            />
          </div>
          <input
            type="date"
            className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 outline-none"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
          <input
            type="date"
            className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 outline-none"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">
                  Karyawan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">
                  Clock In
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">
                  Clock Out
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center text-neutral-400"
                  >
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Menarik data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center text-neutral-400 text-sm"
                  >
                    Tidak ada data presensi.
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const status = getAttendanceStatus(item.check_in_time);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        <span className="font-medium">
                          {formatDate(item.check_in_time)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-neutral-800 text-sm">
                          {item.user?.name || "No Name"}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {item.user?.email || "-"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-neutral-600">
                        {formatTime(item.check_in_time)}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-neutral-600">
                        {formatTime(item.check_out_time)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${status.class}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-neutral-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handlePreview(item.id)}
                          className="p-2 text-neutral-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500">
            Menampilkan{" "}
            <span className="text-neutral-900 font-bold">{data.length}</span>{" "}
            dari{" "}
            <span className="text-neutral-900 font-bold">{totalItems}</span>{" "}
            data
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 border border-neutral-200 rounded-lg bg-white disabled:opacity-50 hover:bg-neutral-50"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-neutral-500 border border-neutral-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage >= totalPages || totalPages <= 1}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 border border-neutral-200 rounded-lg bg-white disabled:opacity-50 hover:bg-neutral-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <AttendancePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={selectedAttendance}
      />

      <AttendanceEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedItem}
        onRefresh={fetchAttendance}
      />
    </div>
  );
};

export default AttendancePage;
