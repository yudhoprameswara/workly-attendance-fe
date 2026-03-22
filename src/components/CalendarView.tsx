import React, { useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Calendar as CalendarIcon,
  Info,
  LogIn,
  LogOut,
  MapPin,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Attendance {
  id: number | string;
  check_in_time: string;
  check_out_time: string | null;
  device_info: string;
  ip_address: string;
  location_in: string;
}

interface CalendarViewProps {
  data: Attendance[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const isLate = (timeStr: string) => {
    const time = new Date(timeStr);
    return (
      time.getHours() > 8 || (time.getHours() === 8 && time.getMinutes() > 30)
    );
  };

  const selectedData = useMemo(() => {
    if (!selectedDate) return null;
    const dateString = selectedDate.toLocaleDateString("en-CA");
    return data.find((item) => item.check_in_time.startsWith(dateString));
  }, [selectedDate, data]);

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const dateString = date.toLocaleDateString("en-CA");
      const attendance = data.find((item) =>
        item.check_in_time.startsWith(dateString),
      );

      if (attendance) {
        const late = isLate(attendance.check_in_time);
        return (
          <div className="flex justify-center mt-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`h-1.5 w-1.5 rounded-full ${late ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"}`}
            />
          </div>
        );
      }
    }
    return null;
  };

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const day = date.getDay();
      const dateString = date.toLocaleDateString("en-CA");
      const hasAttendance = data.some((item) =>
        item.check_in_time.startsWith(dateString),
      );
      let classes = "transition-all duration-200 ease-in-out ";
      if (day === 0 || day === 6) classes += " weekend-tile";
      if (hasAttendance) classes += " has-attendance font-black";
      return classes.trim();
    }
    return "";
  };

  const getSimpleLocation = (location: string) => {
    const [lat, lng] = location.split(",").map(Number);

    if (lat >= -6.35 && lat <= -6.25 && lng >= 106.6 && lng <= 106.75) {
      return "Tangerang Selatan";
    }

    return "Luar Kantor / Remote";
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-neutral-100">
        <style>{`
          .react-calendar { width: 100% !important; border: none !important; font-family: inherit !important; background: transparent !important; }
          .react-calendar__navigation { margin-bottom: 2rem !important; display: flex; gap: 10px; }
          .react-calendar__navigation button { min-width: 44px !important; background: #f8fafc !important; border-radius: 16px !important; font-weight: 900 !important; color: #1e293b !important; font-size: 0.8rem; transition: all 0.2s; border: 1px solid #f1f5f9; }
          .react-calendar__navigation button:hover { background: #eff6ff !important; color: #2563eb !important; border-color: #dbeafe; }
          .react-calendar__month-view__weekdays { font-weight: 900 !important; text-transform: uppercase !important; font-size: 0.65rem !important; color: #94a3b8 !important; letter-spacing: 0.1em; margin-bottom: 1rem; }
          .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; }
          .react-calendar__month-view__days__day { padding: 1.25rem 0.5rem !important; font-weight: 700 !important; color: #334155 !important; position: relative; border-radius: 18px !important; }
          .react-calendar__tile--now { background: #f0f9ff !important; color: #0284c7 !important; font-weight: 900 !important; }
          .react-calendar__tile--active { background: #2563eb !important; color: white !important; box-shadow: 0 12px 20px -5px rgba(37, 99, 235, 0.3); }
          .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus { background: #1d4ed8 !important; }
          .weekend-tile { color: #ef4444 !important; }
        `}</style>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 italic">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-neutral-900 tracking-tighter uppercase italic">
                Kalender <span className="text-blue-600">Kerja</span>
              </h2>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Pilih tanggal untuk detail
              </p>
            </div>
          </div>
        </div>

        <Calendar
          onChange={(val) => setSelectedDate(val as Date)}
          value={selectedDate}
          tileContent={getTileContent}
          tileClassName={getTileClassName}
          locale="id-ID"
        />
      </div>

      <div className="lg:col-span-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate?.toISOString()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {selectedData ? (
              <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] h-full flex flex-col">
                <div className="mb-8">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
                    Rincian Kehadiran
                  </p>
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tighter">
                    {selectedDate?.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </h3>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="p-5 rounded-[2rem] bg-green-50/50 border border-green-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm border border-green-50">
                        <LogIn size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-green-700/50 uppercase tracking-widest">
                          Check In
                        </p>
                        <p className="text-lg font-black text-neutral-800 italic">
                          {new Date(
                            selectedData.check_in_time,
                          ).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    {isLate(selectedData.check_in_time) && (
                      <span className="bg-red-100 text-red-600 text-[9px] font-black px-3 py-1 rounded-full uppercase italic">
                        Terlambat
                      </span>
                    )}
                  </div>

                  <div
                    className={`p-5 rounded-[2rem] border flex items-center justify-between ${selectedData.check_out_time ? "bg-blue-50/50 border-blue-100" : "bg-neutral-50 border-neutral-100 opacity-60"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                        <LogOut size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-blue-700/50 uppercase tracking-widest">
                          Check Out
                        </p>
                        <p className="text-lg font-black text-neutral-800 italic">
                          {selectedData.check_out_time
                            ? new Date(
                                selectedData.check_out_time,
                              ).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "--:--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-neutral-50 space-y-3">
                    <div className="flex items-center gap-3 text-neutral-500">
                      <MapPin size={14} className="text-neutral-300" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">
                        {getSimpleLocation(selectedData.location_in)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-500">
                      <Clock size={14} className="text-neutral-300" />
                      <span className="text-[10px] font-medium leading-tight line-clamp-1">
                        {selectedData.device_info}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-neutral-900 rounded-3xl p-6 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 blur-[50px] opacity-20 -mr-10 -mt-10" />
                  <p className="text-[9px] font-bold text-neutral-400 uppercase mb-1">
                    Total Jam Kerja
                  </p>
                  <p className="text-2xl font-black italic">{calculateDuration(selectedData.check_in_time,selectedData.check_out_time!
                  )}</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-300 shadow-sm mb-6">
                  <Info size={32} />
                </div>
                <h4 className="text-lg font-black text-slate-400 uppercase italic tracking-tighter">
                  Tidak Ada Data
                </h4>
                <p className="text-sm text-slate-400 mt-2 max-w-[200px] font-medium">
                  Anda tidak melakukan presensi pada tanggal ini.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarView;
