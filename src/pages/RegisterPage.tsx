import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Lock,
  User,
  Mail,
  AlertCircle,
  LoaderCircle,
  UsersRound,
  ArrowLeft,
} from "lucide-react";
import api from "../api/axios";
import StatusModal from "../components/StatusModal";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type:  "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/user", formData);
      setModalConfig((prev) => ({
        ...prev,
        type: "success",
        title: "Berhasil",
        message: "Register Berhasil Silahkan Login!",
      }));
      navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registrasi gagal, coba lagi nanti.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-0 md:p-6 lg:p-10 font-sans">
      <div className="flex w-full max-w-[1400px] h-full md:h-[90vh] bg-white md:rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden">
        <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-16 flex-col justify-between text-white relative">
          <StatusModal
            {...modalConfig}
            onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
          />

          <div className="relative z-10 flex items-center gap-3">
            <UsersRound size={28} />
            <h1 className="text-2xl font-bold">
              Workly<span className="font-light opacity-80">Attendance</span>
            </h1>
          </div>
          <div>
            <h2 className="text-4xl font-bold mb-4">
              Mulai Perjalanan Profesionalmu.
            </h2>
            <p className="text-blue-100 font-light leading-relaxed">
              Bergabunglah dengan ribuan karyawan lainnya yang sudah beralih ke
              sistem presensi digital yang lebih cerdas.
            </p>
          </div>
          <div className="text-sm opacity-60">
            © 2026 Workly Attendance System
          </div>
        </div>

        <div className="flex-1 p-8 md:p-12 xl:p-16 flex flex-col justify-center">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Kembali ke Login
          </button>

          <h2 className="text-3xl font-extrabold text-neutral-900 mb-2">
            Buat Akun Baru
          </h2>
          <p className="text-neutral-500 mb-8 font-light">
            Lengkapi data diri untuk akses dashboard karyawan.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase ml-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="Andreas Taulany"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase ml-1">
                  Email Kantor
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="andreas@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-500 uppercase ml-1">
                Username
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-500 uppercase ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  size={18}
                />
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="Min. 8 Karakter"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:bg-neutral-200 flex justify-center items-center gap-2 mt-4"
            >
              {loading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <>
                  <UserPlus size={20} /> Daftar Akun
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
