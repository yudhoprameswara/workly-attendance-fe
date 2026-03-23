import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPinCheckInside,
  CalendarDays,
  UserCheck,
  LoaderCircle,
  Timer,
  LogIn,
  LogOut,
  Info,
  Bell,
  Fingerprint,
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

  const userStore = useAuthStore((state) => state.user);
  const userName = userStore?.name || "Karyawan";

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

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
            message: "Presensi Masuk Berhasil dicatat.",
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
      () => {
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
          message: "Presensi Pulang Berhasil dicatat.",
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
    if (!checkInTime || checkInTime === "--:--") return false;
    const match = checkInTime.match(/(\d{1,2})[:.](\d{1,2})/);
    if (!match) return false;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const now = new Date();
    const checkInDate = new Date();
    checkInDate.setHours(hours, minutes, 0, 0);
    return (now.getTime() - checkInDate.getTime()) / (1000 * 60) >= 60; //ubah minimal waktu kerja
  };

  useEffect(() => {
    fetchAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [userStore?.id]);

  const handleGmailClick = () => {
    const email = "workly.admin@yopmail.com";
    const subject = encodeURIComponent("Bantuan Presensi - Workly");
    const body = encodeURIComponent(
     `Halo Admin,\n\nSaya ${userStore.name} dengan ID [${userStore.id}] ingin bertanya mengenai...`,
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;

    window.open(gmailUrl, "_blank");
  };
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
      title: "Tanggal Hari Ini",
      value: formatDate(currentTime),
      icon: CalendarDays,
      color: "neutral",
    },
  ];

  return (
    <div className="min-h-screen ] p-4 md:p-8 lg:p-12 font-sans text-neutral-900">
      <StatusModal {...modalConfig} onClose={closeModal} />
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) =>
          cameraMode === "in" ? handleCheckIn(file) : handleCheckOut(file)
        }
      />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 w-2 h-2 rounded-full" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
              Workly Dashboard
            </p>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-neutral-900 italic">
            Halo,{" "}
            <span className="text-blue-600 decoration-blue-100 underline-offset-4">
              {userName}
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {/* <button className="p-3 bg-white border border-neutral-100 rounded-2xl shadow-sm text-neutral-400 hover:text-blue-600 transition-colors">
            <Bell size={20} />
          </button> */}
          <div className="h-10 w-[1px] bg-neutral-100 mx-2" />
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black uppercase text-neutral-400">
              Shift Aktif
            </p>
            <p className="text-sm font-bold">08:30 - 17:30</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const cardStyle: any = {
            blue: "bg-blue-50/50 border-blue-100 text-blue-700",
            green: "bg-green-50/50 border-green-100 text-green-700",
            red: "bg-red-50/50 border-red-100 text-red-700",
            orange: "bg-orange-50/50 border-orange-100 text-orange-700",
            neutral: "bg-white border-neutral-100 text-neutral-800 shadow-sm",
          };
          return (
            <div
              key={idx}
              className={`p-8 rounded-[2.5rem] border ${cardStyle[card.color]} transition-all hover:scale-[1.02]`}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-2xl ${card.color === "neutral" ? "bg-neutral-50" : "bg-white shadow-sm"}`}
                >
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                {card.title}
              </p>
              <p className="text-2xl font-black tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-neutral-100 rounded-[3rem] p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-20 border border-blue-200 rounded-[2rem] flex items-center justify-center mb-8 rotate-6 shadow-xl shadow-neutral-200">
            <Fingerprint className="text-blue-400" size={40} />
          </div>

          <h3 className="text-3xl font-black text-neutral-900 italic uppercase tracking-tighter mb-4">
            Konfirmasi <span className="text-blue-600">Presensi</span>
          </h3>
          <p className="text-neutral-400 text-sm max-w-sm mb-10 leading-relaxed font-medium">
            Pastikan wajah terlihat jelas dan GPS aktif sebelum menekan tombol
            di bawah.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
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
              className={`h-20 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-4 border-b-4
                ${
                  attendanceStatus.checkIn !== "--:--" &&
                  attendanceStatus.checkIn !== null
                    ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                    : "bg-blue-600 text-white border-blue-800 hover:bg-blue-700 shadow-lg shadow-blue-100 active:border-b-0 active:translate-y-1"
                }`}
            >
              {loading && cameraMode === "in" ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <LogIn size={24} />
              )}
              <span>
                {attendanceStatus.checkIn !== "--:--" &&
                attendanceStatus.checkIn !== null
                  ? `MASUK: ${attendanceStatus.checkIn}`
                  : "ABSEN MASUK"}
              </span>
            </button>

            <button
              onClick={() => {
                if (!isWorkTimeEnough(attendanceStatus.checkIn)) {
                  setModalConfig({
                    isOpen: true,
                    type: "info",
                    title: "Belum Bisa Pulang",
                    message: "Minimal durasi kerja adalah 1 jam.",
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
              className={`h-20 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-4 border-b-4
                ${
                  attendanceStatus.checkIn === "--:--" ||
                  attendanceStatus.checkOut !== null
                    ? "bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed"
                    : "bg-white text-orange-600 border-orange-200 shadow-sm hover:bg-orange-50 active:border-b-0 active:translate-y-1"
                }`}
            >
              {loading && cameraMode === "out" ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <LogOut size={24} />
              )}
              <span>
                {attendanceStatus.checkOut
                  ? "PRESENSI SELESAI"
                  : "ABSEN PULANG"}
              </span>
            </button>
          </div>

          <div className="mt-12 flex items-center gap-3 bg-blue-50 px-5 py-2.5 rounded-full text-blue-600 border border-blue-100">
            <Info size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Sistem Geofencing Aktif - Radius 50 Meter
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex-1 flex flex-col justify-between relative overflow-hidden">
            {/* Dekorasi Background Halus */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50" />

            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Timer className="text-blue-600" size={24} />
              </div>

              <h4 className="text-xl font-black uppercase italic tracking-tighter text-neutral-900 mb-6">
                Jadwal <span className="text-blue-600">Shift</span>
              </h4>

              <div className="space-y-5">
                {/* Jam Masuk */}
                <div className="group flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all duration-300">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">
                      Jam Masuk
                    </span>
                    <span className="text-lg font-black text-neutral-800">
                      08:30{" "}
                      <span className="text-xs font-medium text-neutral-400">
                        WIB
                      </span>
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-green-100/50 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Jam Pulang */}
                <div className="group flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-orange-100 hover:bg-white transition-all duration-300">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">
                      Jam Pulang
                    </span>
                    <span className="text-lg font-black text-neutral-800">
                      17:30{" "}
                      <span className="text-xs font-medium text-neutral-400">
                        WIB
                      </span>
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <p className="text-[10px] text-blue-700 font-bold leading-relaxed flex gap-2">
                <Info size={12} className="shrink-0" />
                <span>
                  Pastikan melakukan checkout tepat waktu untuk validasi durasi
                  kerja.
                </span>
              </p>
            </div>
          </div>

          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white flex items-center justify-between group cursor-pointer hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <div onClick={handleGmailClick}>
              <p className="text-[10px] font-bold uppercase opacity-70 tracking-widest">
                Butuh Bantuan?
              </p>
              <h4 className="text-lg font-black italic tracking-tighter uppercase">
                Hubungi HRD
              </h4>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck size={20} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-8 bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-center font-bold text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
