import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  MapPinCheckInside,
  CalendarDays,
  ArrowRight,
  UserCheck,
  LoaderCircle,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import api from "../api/axios";
import CameraModal from "../components/CameraModal";
import StatusModal from "../components/StatusModal";

interface AttendanceData {
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  color: string;
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const DashboardPage = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [attendanceStatus, setAttendance] = useState<AttendanceData>({
    checkIn: null,
    checkOut: null,
    status: "Belum Absen",
    color: "neutral",
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cameraMode, setCameraMode] = useState<"in" | "out">("in");
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success" as "success" | "error" | "info",
    title: "",
    message: "",
  });
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });
  const userStore = useAuthStore((state) => state.user);
  const userName = userStore?.name || "Karyawan";

  const getAttendanceStatus = (checkInTime: string) => {
    const time = new Date(checkInTime);
    const hours = time.getHours();
    const minutes = time.getMinutes();

    const checkInInMinutes = hours * 60 + minutes;
    const targetInMinutes = 8 * 60 + 30;
    const toleranceInMinutes = targetInMinutes + 15;

    if (checkInInMinutes <= targetInMinutes) {
      return { label: "Tepat Waktu", color: "green" };
    } else if (checkInInMinutes <= toleranceInMinutes) {
      return { label: "Toleransi", color: "orange" };
    } else {
      return { label: "Terlambat", color: "red" };
    }
  };

  const fetchAttendance = async () => {
    if (!userStore?.id) return;

    try {
      const response: any = await api.get(
        `/attendance/user-today/${userStore?.id}`,
      );
      const latestAbsen = response.data || response;

      if (latestAbsen && latestAbsen.check_in_time) {
        const statusInfo = getAttendanceStatus(latestAbsen.check_in_time);
        const rawDate = new Date(latestAbsen.check_in_time);
        const jamMenit = rawDate.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });

        setAttendance({
          checkIn: jamMenit,
          checkOut: latestAbsen.check_out_time,
          status: latestAbsen.check_out_time
            ? "Sudah Pulang"
            : statusInfo.label,
          color: latestAbsen.check_out_time ? "blue" : statusInfo.color,
        });
      } else {
        setAttendance({
          checkIn: "--:--",
          checkOut: null,
          status: "Belum Absen",
          color: "neutral",
        });
      }
    } catch (err: any) {
      console.error("Gagal tarik data:", err);
    }
  };

  const handleCheckIn = async (file: File) => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      alert("Browser tidak mendukung geolokasi");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const formData = new FormData();
          formData.append("photo", file);
          formData.append("latitude", latitude.toString());
          formData.append("longitude", longitude.toString());

          await api.post("/attendance/check-in", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          setModalConfig({
            isOpen: true,
            type: "success",
            title: "Berhasil!",
            message: "Presensi Berhasil!.",
          });
          fetchAttendance();
        } catch (err: any) {
          const msg = err.response?.data?.message || "Gagal absen, coba lagi";
          setModalConfig({
            isOpen: true,
            type: "error",
            title: "Absen Gagal",
            message: msg,
          });
          setError(msg);
        } finally {
          setLoading(false);
        }
      },
      (geoErr) => {
        alert("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
        setLoading(false);
      },
    );
  };

  const handleCheckOut = async (file: File) => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("latitude", latitude.toString());
        formData.append("longitude", longitude.toString());

        await api.post("/attendance/check-out", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setModalConfig({
          isOpen: true,
          type: "success",
          title: "Berhasil!",
          message: "Presensi Pulang Berhasil!.",
        });
        fetchAttendance();
      } catch (err: any) {
        const msg = err.response?.data?.message || "Gagal absen, coba lagi";
        setModalConfig({
          isOpen: true,
          type: "error",
          title: "Absen Gagal",
          message: msg,
        });
      } finally {
        setLoading(false);
      }
    });
  };

  const isWorkTimeEnough = (checkInTime: string | null) => {
    if (!checkInTime || checkInTime === "--:--" || checkInTime === null)
      return false;
    const match = checkInTime.match(/(\d{1,2})[:.](\d{1,2})/);

    if (!match) {
      console.error("Format jam tidak dikenali:", checkInTime);
      return false;
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    const now = new Date();
    const checkInDate = new Date();

    checkInDate.setHours(hours, minutes, 0, 0);
    const diffInMs = now.getTime() - checkInDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    return diffInMinutes >= 1;
  };

  useEffect(() => {
    fetchAttendance();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [userStore?.id]);

  const statCards = [
    {
      title: "Waktu Sekarang",
      value: formatTime(currentTime),
      icon: Clock,
      color: "blue",
    },
    {
      title: "Status Hari Ini",
      value: attendanceStatus.status,
      icon: MapPinCheckInside,
      color: attendanceStatus.color,
    },
    {
      title: "Tanggal",
      value: formatDate(currentTime),
      icon: CalendarDays,
      color: "neutral",
    },
  ];

  return (
    <div className="space-y-10 p-4 md:p-0">
      <StatusModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={closeModal}
      />
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          if (cameraMode === "in") {
            handleCheckIn(file);
          } else {
            handleCheckOut(file);
          }
        }}
      />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl text-neutral-600 font-light">
            Halo, Selamat Pagi, 👋
          </h3>
          <h2 className="text-4xl font-extrabold text-neutral-950 tracking-tighter mt-1">
            {userName}
          </h2>
        </div>
        {/* <button className="px-6 py-3 bg-white border border-neutral-200 rounded-xl font-semibold text-neutral-800 flex items-center gap-2.5 hover:shadow-md transition-shadow">
          Isi Cuti / Izin
          <ArrowRight size={18} className="text-neutral-400" />
        </button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const cardColors: any = {
            blue: "border-blue-100 bg-blue-50 text-blue-600",
            green: "border-green-100 bg-green-50 text-green-700",
            red: "border-red-100 bg-red-50 text-red-600",
            neutral: "border-neutral-100 bg-white text-neutral-600",
          };
          return (
            <div
              key={idx}
              className={`p-6 border rounded-2xl flex items-start gap-5 shadow-sm ${cardColors[card.color]}`}
            >
              <div
                className={`p-3.5 rounded-xl ${cardColors[card.color]} border-2 border-white shadow-inner`}
              >
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium opacity-70">{card.title}</p>
                <p className="text-2xl font-bold mt-1 tracking-tight">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-8 md:p-10 bg-white border border-neutral-100 rounded-3xl shadow-xl flex flex-col items-center text-center">
        <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <UserCheck className="text-blue-600" size={40} />
        </div>
        <h4 className="text-2xl font-bold text-neutral-950">
          Presensi Harian Anda
        </h4>
        <p className="text-neutral-600 max-w-md mt-2 mb-8 font-light">
          Silahkan lakukan presensi masuk atau pulang. Pastikan GPS aktif.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
          <button
            onClick={() => {
              setCameraMode("in");
              setIsCameraOpen(true);
            }}
            disabled={
              loading ||
              (attendanceStatus.checkIn !== "--:--" &&
                attendanceStatus.checkIn !== null)
            }
            className={`h-16 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2
        ${
          attendanceStatus.checkIn !== "--:--" &&
          attendanceStatus.checkIn !== null
            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 active:scale-95"
        }`}
          >
            {loading ? (
              <LoaderCircle className="animate-spin" size={24} />
            ) : attendanceStatus.checkIn !== "--:--" &&
              attendanceStatus.checkIn !== null ? (
              `Masuk: ${attendanceStatus.checkIn}`
            ) : (
              "Presensi Masuk"
            )}
          </button>

          <button
            onClick={() => {
              if (!isWorkTimeEnough(attendanceStatus.checkIn)) {
                setModalConfig({
                  isOpen: true,
                  type: "info",
                  title: "Belum Bisa Pulang",
                  message:
                    "Minimal durasi kerja adalah 1 jam. Silahkan kembali nanti.",
                });
                return;
              }
              setCameraMode("out");
              setIsCameraOpen(true);
            }}
            disabled={
              loading ||
              attendanceStatus.checkIn === "--:--" ||
              attendanceStatus.checkOut !== null
            }
            className={`h-16 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
    ${
      attendanceStatus.checkIn === "--:--" || attendanceStatus.checkOut !== null
        ? "bg-neutral-50 text-neutral-400 cursor-not-allowed border border-neutral-100"
        : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-95"
    }`}
          >
            {loading && cameraMode === "out" ? (
              <LoaderCircle className="animate-spin" size={24} />
            ) : attendanceStatus.checkOut ? (
              `Pulang: ${new Date(attendanceStatus.checkOut).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
            ) : (
              "Presensi Pulang"
            )}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-red-600 text-sm font-medium">{error}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
