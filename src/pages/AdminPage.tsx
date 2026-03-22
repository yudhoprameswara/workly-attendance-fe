import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  Trash2,
  Edit3,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { adminService } from "../services/adminServices";
import StatusModal from "../components/StatusModal";
import UserFormModal from "../components/UserFormModal";

const AdminPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "confirm" | "success" | "error" | "info";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.findAll(
        currentPage,
        10,
        searchTerm,
        roleFilter,
        titleFilter,
      );

      setUsers(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalItems(response.meta?.totalItems || 0);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, titleFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadUsers();
    }, 500);
    return () => clearTimeout(handler);
  }, [loadUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, titleFilter]);

  const handleDelete = (id: number) => {
    setModalConfig({
      isOpen: true,
      type: "confirm",
      title: "Hapus Pengguna",
      message: "Data yang dihapus tidak dapat dikembalikan. Lanjutkan?",
      onConfirm: async () => {
        try {
          await adminService.remove(id);
          setUsers((prev) => prev.filter((u) => u.id !== id));
          setModalConfig((prev) => ({
            ...prev,
            type: "success",
            title: "Berhasil",
            message: "User dihapus!",
          }));
        } catch (err: any) {
          setModalConfig((prev) => ({
            ...prev,
            type: "error",
            title: "Gagal",
            message: err.message,
          }));
        }
      },
    });
  };

  const handleEdit = (user: any) => {
    if(user.role === ''){
      user.role = 'user'
    }
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    try {
      if (selectedUser) {
        const payload = { ...data };
        if (!payload.password) delete payload.password;

        await adminService.update(selectedUser.id, payload);
        setModalConfig({
          isOpen: true,
          type: "success",
          title: "Berhasil",
          message: `Data ${data.name} berhasil diperbarui.`,
        });
      } else {
        await adminService.create(data);
      }

      setIsFormModalOpen(false);
      loadUsers();
    } catch (err: any) {
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Gagal",
        message: err.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setTitleFilter("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans p-4 md:p-8">
      <StatusModal
        {...modalConfig}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-800">
            Workly <span className="text-blue-600">Admin</span>
          </h1>
          <p className="text-sm text-neutral-500 font-medium italic">
            Manajemen Karyawan & Hak Akses
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          <UserPlus size={18} />
          Tambah User Baru
        </button>
      </div>

      <div className="bg-white p-2 rounded-[24px] border border-transparent flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 flex-wrap w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            className="pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex-1 md:w-40 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-600 outline-none focus:bg-white focus:border-blue-500 transition-all border cursor-pointer appearance-none"
          >
            <option value="">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          {(searchTerm || roleFilter || titleFilter) && (
            <button
              onClick={resetFilters}
              className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
              title="Reset Filter"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">
                  Karyawan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">
                  Jabatan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">
                  Akses
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-10 w-40 bg-neutral-100 rounded-xl"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-24 bg-neutral-50 rounded-lg"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-neutral-50 rounded-lg"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 w-20 bg-neutral-50 rounded-lg ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Search size={48} className="mb-4" />
                      <p className="font-bold uppercase tracking-widest text-xs">
                        Tidak ada data ditemukan
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-neutral-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-neutral-800 text-sm">
                            {user.name}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-neutral-600">
                        {user.title || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                          user.role === "admin"
                            ? "bg-purple-50 text-purple-600 border-purple-100"
                            : "bg-green-50 text-green-600 border-green-100"
                        }`}
                      >
                        {user.role || 'Belum di Set'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1  group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalItems > 0 && (
          <div className="p-6 border-t border-neutral-50 bg-neutral-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs font-medium text-neutral-500">
              Menampilkan{" "}
              <span className="text-neutral-900 font-bold">{users.length}</span>{" "}
              dari{" "}
              <span className="text-neutral-900 font-bold">{totalItems}</span>{" "}
              data
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 border border-neutral-200 rounded-lg bg-white disabled:opacity-50 hover:bg-neutral-50"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "bg-white text-neutral-400 border border-neutral-200 hover:border-blue-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage >= totalPages || totalPages <= 1}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 border border-neutral-200 rounded-lg bg-white disabled:opacity-50 hover:bg-neutral-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedUser}
        loading={formLoading}
      />
    </div>
  );
};

export default AdminPage;
