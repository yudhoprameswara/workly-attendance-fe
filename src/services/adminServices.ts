import api from "../api/axios";

interface AttendanceResponse {
  data: any[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}
export const adminService = {

  findAll: async (page: number = 1, limit: number = 10, search: string, role: string, title: string): Promise<AttendanceResponse> => {
    try {
      const response = await api.get(`admin/users`, {
        params: {
          page,
          limit,
          search,
          role,
          title
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Gagal mengambil data user";
    }
  },

  create: async (userData: any) => {
    try {
      const response = await api.post(`admin/user`, userData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Gagal membuat user baru";
    }
  },

  update: async (id: number, userData: any) => {
    try {
      const response = await api.patch(`admin/update-user/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Gagal memperbarui data user";
    }
  },

  remove: async (id: number) => {
    try {
      const response = await api.delete(`admin/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Gagal menghapus user";
    }
  },
  getAllAttendance: async (page: number = 1, limit: number = 10, search?: string, startDate?: string, endDate?: string) => {
    try {
      const response = await api.get(`attendance/all-attendance`, {
        params: {
          page,
          limit,
          search: search || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }
      });

      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Gagal memuat data presensi";
    }
  },

  getAttendanceById: async (id: number) => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },

  updateAttendance: async (id: number, dto: any) => {
    const response = await api.patch(`/attendance/${id}`, dto);
    return response.data;
  },
};