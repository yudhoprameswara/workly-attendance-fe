import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Calendar as CalendarIcon, Info } from "lucide-react";

interface Attendance {
  id: number | string;
  check_in_time: string;
  check_out_time: string | null;
  device_info: string;
  ip_address: string;
}

interface CalendarViewProps {
  data: Attendance[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ data }) => {
  const isLate = (timeStr: string) => {
    const time = new Date(timeStr);
    return time.getHours() > 8 || (time.getHours() === 8 && time.getMinutes() > 30);
  };

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const dateString = date.toLocaleDateString("en-CA"); 
      const attendance = data.find((item) =>
        item.check_in_time.startsWith(dateString)
      );

      if (attendance) {
        const late = isLate(attendance.check_in_time);
        return (
          <div className="flex flex-col items-center mt-1">
            <div 
              className={`h-1.5 w-1.5 rounded-full animate-pulse ${late ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"}`}
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
        item.check_in_time.startsWith(dateString)
      );

      let classes = "";
      
      if (day === 0 || day === 6) {
        classes += " weekend-tile";
      }

      if (hasAttendance) {
        classes += " has-attendance";
      }

      return classes.trim();
    }
    return "";
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-neutral-100 animate-in fade-in zoom-in-95 duration-500">
      <style>{`
        .react-calendar {
          width: 100% !important;
          border: none !important;
          font-family: inherit !important;
        }
        .react-calendar__navigation {
          margin-bottom: 2rem !important;
          display: flex;
          gap: 8px;
        }
        .react-calendar__navigation button {
          min-width: 44px !important;
          background: #f8f9fa !important;
          border-radius: 14px !important;
          font-weight: 900 !important;
          color: #171717 !important;
          text-transform: uppercase;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .react-calendar__navigation button:hover {
          background: #eff6ff !important;
          color: #2563eb !important;
        }
        .react-calendar__month-view__weekdays {
          font-weight: 900 !important;
          text-transform: uppercase !important;
          font-size: 0.65rem !important;
          color: #d4d4d4 !important;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }
        
        .react-calendar__month-view__weekdays__weekday:nth-child(6) abbr,
        .react-calendar__month-view__weekdays__weekday:nth-child(7) abbr {
          color: #ef4444 !important;
        }

        .react-calendar__month-view__days__day {
          padding: 1rem 0.5rem !important;
          font-weight: 800 !important;
          color: #404040 !important;
          position: relative;
        }

        /* Styling Hari Libur (Weekend) */
        .weekend-tile {
          color: #ef4444 !important;
        }

        .react-calendar__tile--now {
          background: #f0f9ff !important;
          color: #0369a1 !important;
          border-radius: 16px;
        }
        .react-calendar__tile--active {
          background: #2563eb !important;
          color: white !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);
        }
        .react-calendar__tile:hover {
          background: #f8fafc !important;
          border-radius: 16px;
        }
        .has-attendance {
          font-weight: 900 !important;
        }
        abbr[title] {
          text-decoration: none !important;
        }
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-neutral-800 uppercase tracking-tight">Kalender Presensi</h2>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Aktivitas Bulanan</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-neutral-50 rounded-2xl border border-neutral-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-tighter">On-Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-tighter">Late</span>
          </div>
        </div>
      </div>

      <Calendar
        tileContent={getTileContent}
        tileClassName={getTileClassName}
        className="w-full"
        locale="id-ID"
      />

      <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
        <Info size={16} className="text-blue-500 mt-0.5" />
        <p className="text-[10px] leading-relaxed text-blue-700 font-medium">
          Titik berwarna di bawah angka tanggal menunjukkan riwayat kehadiran. 
          Warna <span className="font-bold text-red-600">Merah pada angka</span> menandakan hari libur (Sabtu/Minggu). 
          Titik <span className="font-bold text-green-600">Hijau</span> menandakan hadir tepat waktu.
        </p>
      </div>
    </div>
  );
};

export default CalendarView;