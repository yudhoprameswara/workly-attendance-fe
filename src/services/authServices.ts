import api from "../api/axios"

export const authService = {

    changePassword: async (oldPassword: string, newPassword: string) => {
        try {
            const response = await api.patch('user/change-password', {
                oldPassword,
                newPassword
            })
            return response.data
        } catch (error: any) {
            throw error.response?.data || "Gagal ganti password";
        }
    }
}