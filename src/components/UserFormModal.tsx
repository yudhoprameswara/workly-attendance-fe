import React, { useEffect, useState } from "react";
import { X, Save, Loader2 } from "lucide-react";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  loading?: boolean;
}

const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}: UserFormModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    title: "",
    role: "user",
    password: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: "",
      });
    } else {
      setFormData({
        name: "",
        username: "",
        email: "",
        title: "",
        role: "user",
        password: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-black text-neutral-900 uppercase italic">
                {initialData ? "Edit" : "Tambah"}{" "}
                <span className="text-blue-600">User</span>
              </h2>
              <p className="text-xs text-neutral-400 font-bold">
                Lengkapi informasi detail karyawan
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X size={20} className="text-neutral-400" />
            </button>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(formData);
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-neutral-50 border-transparent focus:bg-white focus:border-blue-200 rounded-2xl text-sm font-medium outline-none border transition-all"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-neutral-50 border-transparent focus:bg-white focus:border-blue-200 rounded-2xl text-sm font-medium outline-none border transition-all"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-neutral-400 ml-2">
                Email Workly
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-neutral-50 border-transparent focus:bg-white focus:border-blue-200 rounded-2xl text-sm font-medium outline-none border transition-all"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-2">
                  Jabatan
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-neutral-50 border-transparent focus:bg-white focus:border-blue-200 rounded-2xl text-sm font-medium outline-none border transition-all"
                  value={formData.title}
                  placeholder="e.g. Frontend Developer"
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-2">
                  Akses Role
                </label>
                <select
                  className="w-full px-4 py-3 bg-neutral-50 border-transparent focus:bg-white focus:border-blue-200 rounded-2xl text-sm font-bold text-neutral-600 outline-none border transition-all cursor-pointer"
                  value={formData.role}
                  onChange={(e) =>{
                    setFormData({ ...formData, role: e.target.value })}
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-neutral-400 ml-2">
                Password{" "}
                {initialData && (
                  <span className="text-blue-500 lowercase font-normal italic">
                    (Kosongkan jika tidak diubah)
                  </span>
                )}
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-neutral-50 border-transparent focus:bg-white focus:border-blue-200 rounded-2xl text-sm font-medium outline-none border transition-all"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-2xl font-bold text-sm text-neutral-500 hover:bg-neutral-50 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {initialData ? "Simpan Perubahan" : "Buat User Baru"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
