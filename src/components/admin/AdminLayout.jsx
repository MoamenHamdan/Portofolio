import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Award, Home, Menu, X, LogOut,
  MessageSquare, Cpu, Mail, BookOpen, Shield, Share2
} from 'lucide-react';

const navItems = [
  { to: '/admin',                  label: 'Dashboard',       icon: LayoutDashboard, end: true },
  { to: '/admin/home-content',    label: 'Home Content',    icon: Home },
  { to: '/admin/skills',          label: 'Skills',          icon: Cpu },
  { to: '/admin/projects',        label: 'Projects',        icon: FolderKanban },
  { to: '/admin/certificates',    label: 'Certificates',    icon: Award },
  { to: '/admin/testimonials',    label: 'Testimonials',    icon: MessageSquare },
  { to: '/admin/social-links',    label: 'Social Links',    icon: Share2 },
  { to: '/admin/messages',        label: 'Messages',        icon: Mail },
  { to: '/admin/blog-posts',      label: 'Blog Posts',      icon: BookOpen },
  { to: '/admin/soc-credibility', label: 'SOC Credibility', icon: Shield },
];

const AdminLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-[#030014] text-white font-['Poppins',sans-serif]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          bg-white/5 backdrop-blur-xl border-r border-white/10`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#b91c1c] to-[#ef4444] flex items-center justify-center shadow-lg shadow-red-500/30">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Admin Panel</p>
            <p className="text-xs text-gray-400">Portfolio Manager</p>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-[#b91c1c]/30 to-[#ef4444]/20 text-white border border-[#b91c1c]/40 shadow-lg shadow-red-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        {onLogout && (
          <div className="p-4 border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <button
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-white">Portfolio Admin</h1>
            <p className="text-xs text-gray-500">Manage your portfolio content</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b91c1c] to-[#ef4444] flex items-center justify-center text-xs font-bold shadow-lg shadow-red-500/30">
              M
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
