import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  CalendarDays, 
  Receipt, 
  LogOut, 
  HeartPulse
} from 'lucide-react';
import type { User, Role } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: Role[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
}) => {
  const role: Role = currentUser?.role || 'RECEPTIONIST';

  // Role-Based Access Control (RBAC) navigation matrix
  const allMenuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      allowedRoles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] 
    },
    { 
      id: 'patients', 
      label: 'Patients', 
      icon: Users, 
      allowedRoles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] 
    },
    { 
      id: 'doctors', 
      label: 'Doctors', 
      icon: UserCheck, 
      allowedRoles: ['ADMIN'] // Only Admin manages doctor hiring/profiles
    },
    { 
      id: 'appointments', 
      label: role === 'DOCTOR' ? 'My Appointments' : 'Appointments', 
      icon: CalendarDays, 
      allowedRoles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] 
    },
    { 
      id: 'billing', 
      label: 'Billing & Invoices', 
      icon: Receipt, 
      allowedRoles: ['ADMIN', 'RECEPTIONIST'] // Doctors don't handle billing
    },
  ];

  // Filter menu items by user role
  const visibleMenuItems = allMenuItems.filter((item) => item.allowedRoles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col justify-between shadow-xl">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">ClinicFlow</h1>
            <p className="text-[10px] text-sky-400 font-medium uppercase tracking-wider">Clinical Care OS</p>
          </div>
        </div>

        {/* Navigation Links filtered by Role */}
        <nav className="p-4 space-y-1.5">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  active
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session Profile & Role Badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 text-xs font-semibold">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.fullName || 'User'}</p>
              <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border ${
                role === 'ADMIN'
                  ? 'bg-purple-950 text-purple-300 border-purple-800/50'
                  : role === 'DOCTOR'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800/50'
                  : 'bg-sky-950 text-sky-300 border-sky-800/50'
              }`}>
                {role}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
