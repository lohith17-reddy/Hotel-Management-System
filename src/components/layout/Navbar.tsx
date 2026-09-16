import React, { useState, useEffect } from 'react';
import {
  Building2,
  Bell,
  Sparkles,
  RotateCcw,
  LogOut,
  ChevronDown,
  User,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Wrench,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/apiClient.ts';
import { Notification } from '../../types/index.ts';

interface NavbarProps {
  onOpenAIAssistant: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAIAssistant,
  activeTab,
  setActiveTab,
  onNavigateLogin
}) => {
  const { currentUser, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await api.getNotifications(currentUser.id);
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.warn('Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id: string, link?: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
      if (link) {
        const tab = link.replace('/', '');
        if (tab) setActiveTab(tab);
        setShowNotifications(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all demo data back to initial seed state? This will restore default room allocations and predictions.')) {
      setIsResetting(true);
      try {
        await api.resetDatabase();
        window.location.reload();
      } catch (err) {
        alert('Failed to reset database');
        setIsResetting(false);
      }
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
          label: 'Admin',
          icon: ShieldCheck,
        };
      case 'warden':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          label: 'Warden',
          icon: UserCheck,
        };
      case 'student':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Student',
          icon: GraduationCap,
        };
      case 'staff':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          label: 'Staff',
          icon: Wrench,
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          label: 'User',
          icon: User,
        };
    }
  };

  const roleInfo = getRoleBadgeStyle(currentUser?.role);
  const RoleIcon = roleInfo.icon;

  const handleLogoutClick = () => {
    logout();
    if (onNavigateLogin) {
      onNavigateLogin();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Breadcrumb */}
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-xs">
                H
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                  HostelCore <span className="text-indigo-600 italic font-semibold text-xs bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">v2 AI</span>
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 pl-3 border-l border-slate-200">
              <span className="capitalize font-semibold text-indigo-700">{currentUser?.role || 'Guest'}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold capitalize">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Center/Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Academic Year Badge */}
            <div className="hidden sm:inline-flex items-center bg-slate-100 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600 border border-slate-200 uppercase tracking-tight">
              AY 2024-25
            </div>

            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenAIAssistant}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span className="hidden md:inline">AI Resident Assistant</span>
              <span className="md:hidden">Ask AI</span>
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-84 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-800">Notifications ({notifications.length})</div>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">No notifications yet</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id, n.link)}
                          className={`px-4 py-2.5 text-left text-xs cursor-pointer transition-colors ${
                            n.isRead ? 'bg-white opacity-70 hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70 font-medium'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                          {n.link && (
                            <div className="flex items-center text-[10px] text-indigo-600 font-bold mt-1">
                              <span>View details</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-1" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated User Profile & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left text-xs text-slate-700 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-300 flex-shrink-0 flex items-center justify-center">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-bold text-slate-800 leading-tight text-xs flex items-center gap-1.5">
                    <span>{currentUser?.name || 'Authorized User'}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-extrabold uppercase ${roleInfo.bg}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {currentUser?.email}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <RoleIcon className="w-4 h-4 text-indigo-600" />
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-extrabold ${roleInfo.bg}`}>
                        {roleInfo.label} Account
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-1">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{currentUser?.email}</p>
                    {currentUser?.phone && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{currentUser.phone}</p>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => onNavigateLogin && onNavigateLogin()}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      <span>Switch Account / Sign In</span>
                    </button>

                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Log Out of Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Reset Data */}
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Reset Demo Database"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
