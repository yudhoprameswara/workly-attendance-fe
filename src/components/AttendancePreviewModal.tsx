import { X, MapPin, Clock, ArrowRight, Image as ImageIcon } from "lucide-react";
import { AttendanceDetail } from "../pages/AttendancePage";

const formatTime = (dateString: string) => {
  if (!dateString) return "--:--";
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance < 1
    ? `${(distance * 1000).toFixed(0)} meter`
    : `${distance.toFixed(2)} km`;
};

const calculateDuration = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return "0j 0m";

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const diffMs = end.getTime() - start.getTime();

  if (diffMs < 0) return "0j 0m";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}j ${minutes}m`;
};

const AttendancePreviewModal = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: AttendanceDetail | null;
}) => {
  if (!isOpen || !data) return null;

  const [latIn, lngIn] = data.location_in
    ? data.location_in.split(",").map(Number)
    : [0, 0];
  const hasCheckOut = data.location_out && data.location_out !== "";
  const [latOut, lngOut] = hasCheckOut
    ? data.location_out!.split(",").map(Number)
    : [0, 0];

  const distanceInfo = hasCheckOut
    ? calculateDistance(latIn, lngIn, latOut, lngOut)
    : null;

  const mapUrl = hasCheckOut
    ? `https://www.google.com/maps/embed/v1/directions?key=YOUR_GOOGLE_API_KEY&origin=${latIn},${lngIn}&destination=${latOut},${lngOut}&mode=walking`
    : `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_API_KEY&q=${latIn},${lngIn}&zoom=15`;

  const fallbackMapUrl = `https://maps.google.com/maps?q=${latIn},${lngIn}&z=15&output=embed`;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto border border-white/20">
        <div className="w-full md:w-1/2 bg-neutral-100 relative min-h-[350px]">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={fallbackMapUrl}
          />
          <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase">
                  Status Lokasi
                </p>
                <p className="text-xs font-bold text-neutral-800">
                  {hasCheckOut
                    ? "Pergerakan Check-in ke Check-out Terdeteksi"
                    : "Lokasi Check-in Terkunci"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-black text-neutral-900 italic uppercase leading-none">
                Detail <span className="text-blue-600">Log</span>
              </h2>
              <p className="text-sm text-neutral-400 font-bold mt-2 uppercase tracking-widest">
                ID: {data.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-neutral-100 rounded-full transition-all group"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform"
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="group">
              <p className="text-[10px] font-black text-green-600 uppercase mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />{" "}
                Check In
              </p>
              <div className="aspect-[4/5] rounded-[2rem] bg-neutral-50 border-2 border-neutral-100 overflow-hidden relative shadow-sm transition-transform group-hover:scale-[1.02]">
                <img
                  key={data.id}
                  src={data.photo_url}
                  className="w-full h-full object-cover"
                  alt="Check In"
                  loading="lazy"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-xl text-white">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Clock size={14} /> {formatTime(data.check_in_time)}
                  </div>
                </div>
              </div>
            </div>

            <div className="group">
              <p className="text-[10px] font-black text-red-600 uppercase mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Check
                Out
              </p>
              {data.photo_url_out ? (
                <div className="aspect-[4/5] rounded-[2rem] bg-neutral-50 border-2 border-neutral-100 overflow-hidden relative shadow-sm transition-transform group-hover:scale-[1.02]">
                  <img
                    key={data.id}
                    src={data.photo_url_out}
                    className="w-full h-full object-cover"
                    alt="Check In"
                    loading="lazy"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-xl text-white">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Clock size={14} /> {formatTime(data.check_out_time)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-[2rem] bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-300 gap-3 uppercase text-[10px] font-black">
                  <ImageIcon size={40} className="opacity-20" />
                  Belum Selesai
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 p-8 bg-neutral-900 rounded-[32px] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <MapPin size={20} className="text-white" />
                </div>
                <h3 className="font-black italic uppercase text-sm tracking-wider">
                  Laporan Perpindahan
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-xs text-neutral-400 font-bold uppercase">
                    Estimasi Jarak
                  </span>
                  <span className="text-xl font-black text-blue-400 italic">
                    {distanceInfo || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-xs text-neutral-400 font-bold uppercase">
                    Total Durasi Kerja
                  </span>
                  <span className="text-xl font-black text-green-400 italic">
                    {data.check_out_time
                      ? calculateDuration(
                          data.check_in_time,
                          data.check_out_time,
                        )
                      : "Masih Bekerja"}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {hasCheckOut
                    ? `Karyawan telah bekerja selama ${calculateDuration(data.check_in_time, data.check_out_time)} dengan total perpindahan ${distanceInfo}.`
                    : "Karyawan masih dalam status aktif bekerja (belum melakukan checkout)."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AttendancePreviewModal;
