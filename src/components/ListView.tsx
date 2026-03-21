import React from "react";
import { 
  Clock, 
  Monitor, 
  MapPin, 
  ArrowRight, 
  Calendar as CalendarIcon,
  CheckCircle2
} from "lucide-react";

interface Attendance {
  id: number | string;
  check_in_time: string;
  check_out_time: string | null;
  device_info: string;
  ip_address: string;
}

interface ListViewProps {
  data: Attendance[];
}

const XCircleIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

const ListView: React.FC<ListViewProps> = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 opacity-40">
        <CalendarIcon size={48} className="mb-4 text-neutral-300" />
        <p className="font-black uppercase tracking-widest text-[10px] text-neutral-500">Belum ada riwayat</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {data.map((item) => {
        const checkIn = new Date(item.check_in_time);
        const checkOut = item.check_out_time ? new Date(item.check_out_time) : null;
        
        const isLate = checkIn.getHours() > 8 || (checkIn.getHours() === 8 && checkIn.getMinutes() > 30);

        return (
          <div 
            key={item.id} 
            className="group relative bg-white border border-neutral-100 p-5 rounded-[28px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border-2 transition-colors duration-300 ${isLate ? 'bg-red-50 border-red-100 text-red-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                <span className="text-[10px] font-black uppercase leading-none mb-1">
                  {checkIn.toLocaleDateString('id-ID', { month: 'short' })}
                </span>
                <span className="text-xl font-black leading-none">
                  {checkIn.getDate()}
                </span>
              </div>

              <div>
                <h3 className="font-black text-neutral-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                  {checkIn.toLocaleDateString('id-ID', { weekday: 'long' })}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                   <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-100 text-[10px] font-bold text-neutral-500">
                      <Clock size={12} className="text-blue-500" />
                      <span>{checkIn.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')}</span>
                   </div>
                   <ArrowRight size={10} className="text-neutral-300" />
                   <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-100 text-[10px] font-bold text-neutral-500">
                      <Clock size={12} className="text-orange-500" />
                      <span>{checkOut ? checkOut.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':') : '--:--'}</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-neutral-50">
              <div className="space-y-1.5 md:text-right">
                <div className="flex items-center md:justify-end gap-1.5 text-neutral-400">
                  <Monitor size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {item.device_info ? item.device_info.split(' ')[0] : 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center md:justify-end gap-1.5 text-neutral-300">
                  <MapPin size={12} />
                  <span className="text-[10px] font-bold tracking-tight">{item.ip_address}</span>
                </div>
              </div>

              <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border-2 transition-all duration-300 ${isLate ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                  {isLate ? 'Terlambat' : 'Tepat Waktu'}
                </span>
                {isLate ? <XCircleIcon size={16} /> : <CheckCircle2 size={16} />}
              </div>
            </div>
            
          </div>
        );
      })}
    </div>
  );
};

export default ListView;