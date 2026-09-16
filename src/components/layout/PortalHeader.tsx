import React, { useState } from 'react';
import { ShieldCheck, UserCheck, GraduationCap, Wrench, Building2, ChevronRight, Loader2, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface PortalHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, loginWithDemo } = useAuth();
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);
  const role = currentUser?.role || 'admin';

  const handleQuickSwitch = async (targetRole: 'student' | 'warden' | 'admin') => {
    if (currentUser?.role === targetRole) return;
    setSwitchingRole(targetRole);
    try {
      await loginWithDemo(targetRole);
      setActiveTab('dashboard');
    } catch (e) {
      console.error('Failed to switch demo role', e);
    } finally {
      setSwitchingRole(null);
    }
  };

  const getPortalInfo = () => {
    switch (role) {
      case 'admin':
        return {
          title: 'Administrative Master Console',
          badge: 'Admin Access',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: ShieldCheck,
          accentColor: 'text-purple-600',
          scope: 'Central Campus Governance, Room Allocations & Financial Audit'
        };
      case 'warden':
        return {
          title: 'Warden Floor Operations & Roster',
          badge: 'Warden Wing Command',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: UserCheck,
          accentColor: 'text-emerald-600',
          scope: currentUser?.hostelId ? `Assigned to ${currentUser.hostelId === 'h-cvr-1' ? 'C.V. Raman Boys Wing' : 'Sarojini Naidu Girls Wing'}` : 'Resident Supervision & Leave Authorizations'
        };
      case 'student':
        return {
          title: 'Resident Student Self-Service',
          badge: 'Student Portal',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: GraduationCap,
          accentColor: 'text-blue-600',
          scope: 'My Room Allotment, Mess Opt-In & Gate Passes'
        };
      case 'staff':
        return {
          title: 'Staff Maintenance & Operations',
          badge: 'Facility Staff',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: Wrench,
          accentColor: 'text-amber-600',
          scope: 'Assigned Repair Tickets & Mess Daily Food Prep'
        };
      default:
        return {
          title: 'Campus Hostel Portal',
          badge: 'Authenticated',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: Building2,
          accentColor: 'text-indigo-600',
          scope: 'Campus Residence Platform'
        };
    }
  };

  const portal = getPortalInfo();
  const Icon = portal.icon;

  return (
    <div className="bg-white border-b border-slate-200/80 py-2.5 px-4 sm:px-6 lg:px-8 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Left: Active Role Indicator */}
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <Icon className={`w-4 h-4 ${portal.accentColor}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">{portal.title}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-extrabold uppercase ${portal.badgeColor}`}>
                {portal.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">{portal.scope}</p>
          </div>
        </div>

        {/* Right: Authenticated User Status & Demo Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Demo Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 hidden sm:inline">
              Demo:
            </span>
            <button
              type="button"
              onClick={() => handleQuickSwitch('student')}
              disabled={switchingRole !== null}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                role === 'student'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {switchingRole === 'student' ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Student'}
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('warden')}
              disabled={switchingRole !== null}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                role === 'warden'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {switchingRole === 'warden' ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Warden'}
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('admin')}
              disabled={switchingRole !== null}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                role === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {switchingRole === 'admin' ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Admin'}
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-600 pl-1 border-l border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800">{currentUser?.name}</span>
            <span className="text-slate-400 font-mono text-[11px] hidden md:inline">({currentUser?.email})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
