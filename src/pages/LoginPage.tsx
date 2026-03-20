import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, User, AlertCircle, LoaderCircle, BriefcaseBusiness, UsersRound } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { username, password });
      setAuth(response.data.access_token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal, cek koneksi atau akun anda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-0 md:p-6 lg:p-10 font-sans">
      <div className="flex w-full max-w-[1400px] h-full md:h-[90vh] bg-white md:rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden">
        
        <div className="hidden lg:flex lg:w-3/5 bg-blue-600 p-12 lg:p-20 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/40 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-20 w-60 h-60 bg-blue-700 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
              <UsersRound className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Workly<span className='font-light opacity-80'>Attendance</span></h1>
          </div>

          <div className="relative z-10">
            <h2 className="text-5xl xl:text-6xl font-extrabold leading-tight tracking-tighter mb-6">
              Sistem Presensi Karyawan Modern.
            </h2>
            <p className="text-xl text-blue-100 max-w-xl leading-relaxed font-light">
              Kelola kehadiran, izin, dan laporan presensi tim kamu secara real-time dengan mudah dan transparan dalam satu platform terintegrasi.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner flex items-center gap-4">
            <div className="bg-blue-500 p-3 rounded-xl">
              <BriefcaseBusiness className="text-white" size={20} />
            </div>
            <div>
              <p className="font-semibold text-white">Efisiensi Tim Meningkat</p>
              <p className="text-sm text-blue-200">User kami melaporkan penghematan waktu hingga 40%.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full flex items-center justify-center p-8 md:p-12 xl:p-20 bg-white">
          <div className="w-full max-w-[420px]">
            
            <div className="mb-12 text-center lg:text-left">
              <div className="lg:hidden bg-blue-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <UsersRound className="text-blue-600" size={40} />
              </div>
              <h2 className="text-4xl font-extrabold text-neutral-900 tracking-tighter mb-3">Selamat Datang</h2>
              <p className="text-lg text-neutral-600 font-light">Masukkan akun karyawan untuk memulai presensi hari ini.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 shadow-inner">
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-sm">Gagal Login</p>
                  <p className="text-xs opacity-90">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6" autoComplete='off'>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Username Karyawan</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-400 group-focus-within:text-blue-600 transition-colors">
                    <User size={20} />
                  </span>
                  <input
                    type="text"
                    required
                    autoFocus
                    className="block w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 placeholder:font-light focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-inner"
                    placeholder="Masukan Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-neutral-700">Kata Sandi</label>
                  {/* <a href="#" className="text-xs text-blue-600 hover:text-blue-800 hover:underline">Lupa sandi?</a> */}
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={20} />
                  </span>
                  <input
                    type="password"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 placeholder:font-light focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-inner"
                    placeholder="Masukkan sandi Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[54px] bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-neutral-300 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={20} />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Masuk ke Dashboard
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-12">
              Belum punya akun? <span className='text-blue-600 font-medium'>Hubungi HRD</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;