import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  LogOut,
  Menu,
  X,
  UsersRound,
  Bell,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";


const DashboardLayout = () => {
    const user = useAuthStore((state) => state.user);
    user.avatar =
      user?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0D8ABC&color=fff`;
      
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Ringkasan", path: "/dashboard", icon: LayoutDashboard },
    { name: "Presensi Saya", path: "/attendance", icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 bg-white w-72 p-6 flex flex-col justify-between 
        z-50 shadow-xl transition-transform duration-300 ease-in-out border-r border-neutral-100
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}
      >
        <div>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl">
                <UsersRound className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold text-neutral-950">
                Workly<span className="font-light opacity-60">Attendance</span>
              </h1>
            </div>
            <button
              className="lg:hidden text-neutral-500"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-colors
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-inner"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }
                `}
              >
                <item.icon size={22} className="text-blue-600" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut size={22} className="text-red-500" />
          Keluar Aplikasi
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-neutral-100 py-4 px-6 md:px-10 flex items-center justify-between sticky top-0 z-30">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} className="text-neutral-700" />
          </button>

          <h2 className="hidden md:block text-2xl font-semibold text-neutral-900 tracking-tight">
            Dashboard
          </h2>

          <div className="flex items-center gap-6">
            {/* <button className="relative p-2 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-100">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button> */}

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm text-neutral-950">
                  {user.name}
                </p>
                <p className="text-xs text-neutral-500">{user.role}</p>
              </div>
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-neutral-200"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
