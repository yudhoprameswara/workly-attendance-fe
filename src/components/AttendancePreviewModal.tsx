import React, { useCallback, useState, useEffect } from "react";
import {
  X,
  MapPin,
  Clock,
  Image as ImageIcon,
  Briefcase,
  Home,
} from "lucide-react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  Polyline,
} from "@react-google-maps/api";
import { AttendanceDetail } from "../pages/AttendancePage";
const formatTime = (dateString: string) => {
  if (!dateString) return "--:--";
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDistance = (km: number) => {
  return km < 1 ? `${(km * 1000).toFixed(0)} meter` : `${km.toFixed(2)} km`;
};

const OFFICE_COORDS = { lat: -6.295512, lng: 106.667128 };

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapId: "DEMO_MAP_ID",
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

const calculateDistance = (lat1: number, lon1: number) => {
  const R = 6371;
  const dLat = (OFFICE_COORDS.lat - lat1) * (Math.PI / 180);
  const dLon = (OFFICE_COORDS.lng - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(OFFICE_COORDS.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const calculateDuration = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return "0j 0m";
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  const totalMinutes = Math.floor(Math.max(0, diffMs) / (1000 * 60));
  return `${Math.floor(totalMinutes / 60)}j ${totalMinutes % 60}m`;
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
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCG4Z78qAc5WMLKwTOXIrahSo5XPrLd-CA",
    libraries: ["marker"] as any,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const [latIn, lngIn] = data?.location_in
    ? data.location_in.split(",").map(Number)
    : [0, 0];
  const hasCheckOut = !!(data?.location_out && data?.location_out !== "");
  const [latOut, lngOut] = hasCheckOut
    ? data!.location_out!.split(",").map(Number)
    : [0, 0];
  const userCoords = {
    lat: hasCheckOut ? latOut : latIn,
    lng: hasCheckOut ? lngOut : lngIn,
  };

  useEffect(() => {
    if (map && isLoaded && isOpen && userCoords.lat !== 0) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(OFFICE_COORDS);
      bounds.extend(userCoords);
      map.fitBounds(bounds, 100);
    }
  }, [map, isLoaded, isOpen, userCoords]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  if (!isOpen || !data) return null;

  const rawDistance = calculateDistance(userCoords.lat, userCoords.lng);
  const distanceInfo = formatDistance(rawDistance);
  const isWFO = rawDistance < 0.2;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto border border-white/20">
        <div className="w-full md:w-1/2 bg-neutral-100 relative min-h-[400px]">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={OFFICE_COORDS}
              zoom={13}
              onLoad={onLoad}
              options={mapOptions}
            >
              <MarkerF
                position={OFFICE_COORDS}
                label={{ text: "Office", fontSize: "20px" }}
                icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                title="Kantor (Teras Kota)"
              />

              <MarkerF
                position={userCoords}
                label={{ text: "Your Location", fontSize: "20px" }}
                icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                title="Lokasi Anda"
              />

            </GoogleMap>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              Loading Map...
            </div>
          )}

          <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-neutral-100">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${isWFO ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}
              >
                {isWFO ? <Briefcase size={20} /> : <Home size={20} />}
              </div>
              <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase">
                  Status Kehadiran
                </p>
                <p className="text-xs font-bold text-neutral-800">
                  {isWFO
                    ? "Bekerja dari Kantor (WFO)"
                    : "Bekerja dari Luar (WFH)"}
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
                  src={data.photo_url}
                  className="w-full h-full object-cover"
                  alt="Check In"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-xl text-white text-xs font-bold flex items-center gap-2">
                  <Clock size={14} /> {formatTime(data.check_in_time)}
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
                    src={data.photo_url_out}
                    className="w-full h-full object-cover"
                    alt="Check In"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-xl text-white text-xs font-bold flex items-center gap-2">
                    <Clock size={14} /> {formatTime(data.check_out_time)}
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-[2rem] bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-300 gap-3 uppercase text-[10px] font-black">
                  <ImageIcon size={40} className="opacity-20" /> Belum Selesai
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
                  Laporan Lokasi & Waktu
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-xs text-neutral-400 font-bold uppercase">
                    {hasCheckOut
                      ? "Jarak Akhir ke Kantor"
                      : "Jarak Saat Ini ke Kantor"}
                  </span>
                  <span className="text-xl font-black text-blue-400 italic">
                    {distanceInfo}
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
                      : "Aktif"}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed italic">
                  {hasCheckOut
                    ? `Selesai bekerja dengan posisi terakhir ${distanceInfo} dari titik pusat Teras Kota.`
                    : `Karyawan sedang aktif bekerja. Posisi check-in terdeteksi ${distanceInfo} dari kantor.`}
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
