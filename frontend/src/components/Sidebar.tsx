import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  HelpCircle, 
  GitCompare, 
  User, 
  LogOut,
  PlaneTakeoff
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/job-match', label: 'Job Matcher', icon: Briefcase },
    { to: '/interview-prep', label: 'Interview Prep', icon: HelpCircle },
    { to: '/compare', label: 'Compare', icon: GitCompare },
    { to: '/profile', label: 'Profile Settings', icon: User }
  ];

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col justify-between fixed left-0 top-0 z-20">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-border flex items-center gap-3">
          <PlaneTakeoff className="h-6 w-6 text-indigo-400" />
          <span className="font-extrabold text-xl tracking-tight text-gradient-primary">
            ResumePilot
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-zinc-800 text-white border-l-2 border-indigo-500 shadow-sm' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}
              `}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Info & Signout Card */}
      <div className="p-4 border-t border-border flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
            {user?.username?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate text-zinc-100">{user?.username}</span>
            <span className="text-xs text-zinc-500 truncate">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-red-400 text-sm font-medium transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
