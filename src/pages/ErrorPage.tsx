import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-red-200 blur-3xl opacity-20 rounded-full scale-150" />
          <div className="relative p-8 bg-white rounded-[40px] border border-neutral-100 shadow-2xl shadow-red-100">
            <ShieldAlert size={80} className="text-red-500" />
          </div>

          <div className="absolute -top-4 -right-4 bg-neutral-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full rotate-12 shadow-lg tracking-widest">
            ERROR 403/404
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tighter sm:text-5xl uppercase">
            Akses Dibatasi
          </h1>
          <p className="text-neutral-500 font-medium leading-relaxed px-4 text-sm sm:text-base">
            Waduh! Sepertinya Anda tersesat atau tidak memiliki izin khusus
            untuk memasuki area ini. Silakan kembali ke halaman sebelumnya atau
            dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-neutral-200 text-neutral-600 font-bold text-sm hover:bg-neutral-100 hover:border-neutral-300 transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
            KEMBALI
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
          >
            <Home size={18} />
            KE DASHBOARD
          </button>
        </div>

        <div className="pt-8 flex items-center justify-center gap-2 opacity-30">
          <div className="h-px w-8 bg-neutral-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
            Workly Attendance System
          </p>
          <div className="h-px w-8 bg-neutral-400" />
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
