import React from 'react';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  UserPlus,
  ArrowRightLeft,
  Users,
  UtensilsCrossed,
  Wrench,
  CalendarDays,
  UserCheck,
  ClipboardList,
  CreditCard,
  Megaphone,
  Boxes,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenAI }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'admin';

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    highlight?: boolean;
    roles?: Array<'admin' | 'warden' | 'student' | 'staff'>;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const getSections = (): NavSection[] => {
    if (role === 'student') {
      return [
        {
          title: 'My Residence',
          items: [
            { id: 'dashboard', label: 'Student Home', icon: LayoutDashboard },
            { id: 'my-room', label: 'My Room & Bed', icon: BedDouble },
            { id: 'transfers', label: 'Request Room Transfer', icon: ArrowRightLeft },
          ]
        },
        {
          title: 'Mess & Dining',
          items: [
            {
              id: 'food-waste',
              label: 'Smart Meal Opt-In',
              icon: UtensilsCrossed,
              badge: 'AI Menu',
              highlight: true
            },
          ]
        },
        {
          title: 'Requests & Services',
          items: [
            { id: 'leaves', label: 'Outstation Gate Pass', icon: CalendarDays },
            { id: 'complaints', label: 'Lodge Repair Ticket', icon: Wrench },
            { id: 'fees', label: 'My Fees & Receipts', icon: CreditCard },
            { id: 'visitors', label: 'Visitor Passes', icon: UserCheck },
            { id: 'announcements', label: 'Hostel Notices', icon: Megaphone },
          ]
        }
      ];
    }

    if (role === 'warden') {
      return [
        {
          title: 'Warden Command',
          items: [
            { id: 'dashboard', label: 'Warden Dashboard', icon: LayoutDashboard },
          ]
        },
        {
          title: 'Floor & Room Control',
          items: [
            { id: 'hostels', label: 'Assigned Hostel Wing', icon: Building2 },
            { id: 'rooms', label: 'Rooms & Bed Grid', icon: BedDouble },
            { id: 'allocations', label: 'Bed Allocations', icon: UserPlus },
            { id: 'transfers', label: 'Transfer Approvals', icon: ArrowRightLeft },
          ]
        },
        {
          title: 'Resident Supervision',
          items: [
            { id: 'attendance', label: 'Daily Roll Call / Curfew', icon: ClipboardList },
            { id: 'leaves', label: 'Outstation Leave Review', icon: CalendarDays },
            { id: 'students', label: 'Student Roster', icon: Users },
            { id: 'visitors', label: 'Visitor Logs', icon: UserCheck },
          ]
        },
        {
          title: 'Dining & Maintenance',
          items: [
            {
              id: 'food-waste',
              label: 'Mess Headcount & AI',
              icon: UtensilsCrossed,
              badge: 'Sync',
              highlight: true
            },
            { id: 'complaints', label: 'Maintenance Triage', icon: Wrench },
            { id: 'announcements', label: 'Issue Notice', icon: Megaphone },
            { id: 'inventory', label: 'Wing Assets & Keys', icon: Boxes },
          ]
        }
      ];
    }

    // Default: Admin Portal
    return [
      {
        title: 'Administration',
        items: [
          { id: 'dashboard', label: 'Central Executive', icon: LayoutDashboard },
        ]
      },
      {
        title: 'Campus Master Accommodations',
        items: [
          { id: 'hostels', label: 'Hostels & Blocks', icon: Building2 },
          { id: 'rooms', label: 'Rooms & Bed Grid', icon: BedDouble },
          { id: 'allocations', label: 'Bed Allocations', icon: UserPlus },
          { id: 'transfers', label: 'Room Transfers', icon: ArrowRightLeft },
        ]
      },
      {
        title: 'Resident Life & Registry',
        items: [
          { id: 'students', label: 'Student Directory', icon: Users },
          { id: 'attendance', label: 'Daily Attendance', icon: ClipboardList },
          { id: 'leaves', label: 'Leave Requests', icon: CalendarDays },
          { id: 'visitors', label: 'Visitor Registry', icon: UserCheck },
        ]
      },
      {
        title: 'AI Mess & Wastage Control',
        items: [
          {
            id: 'food-waste',
            label: 'Food Wastage AI (Sec 37)',
            icon: UtensilsCrossed,
            badge: 'AI Core',
            highlight: true
          },
        ]
      },
      {
        title: 'Finance & System Operations',
        items: [
          { id: 'complaints', label: 'Complaints & Work Orders', icon: Wrench },
          { id: 'fees', label: 'Fees & Fiscal Invoicing', icon: CreditCard },
          { id: 'announcements', label: 'Campus Announcements', icon: Megaphone },
          { id: 'inventory', label: 'Inventory & Fixed Assets', icon: Boxes },
          { id: 'audit-logs', label: 'Security & Audit Logs', icon: ShieldCheck },
        ]
      }
    ];
  };

  const sections = getSections();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 text-slate-700 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="flex-1 py-5 px-4 space-y-6 overflow-y-auto">
        {sections.map((sec, idx) => {
          const visibleItems = sec.items.filter(item => !item.roles || item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1.5">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {sec.title}
              </div>
              <div className="space-y-1">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${item.highlight && !isActive ? 'bg-indigo-50/40 text-indigo-600 border border-indigo-100' : ''}`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-indigo-600 scale-110' : 'bg-transparent'}`}></span>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : item.highlight ? 'text-indigo-500' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                          isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bento User Profile Card at Sidebar bottom */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              {role === 'warden' ? 'Current Warden' : role === 'student' ? 'Resident Student' : role === 'staff' ? 'Hostel Staff' : 'System Admin'}
            </p>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Dr. Sarah Mitchell'}</p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {role === 'student' ? 'Block A-101 • CSE' : 'Block A-D Supervisor'}
          </p>
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAI}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 text-left transition-colors group cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px]">
              <Bot className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold">Ask AI Resident</span>
          </div>
          <span className="text-xs text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>
    </aside>
  );
};
