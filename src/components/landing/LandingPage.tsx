import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
  BedDouble,
  UtensilsCrossed,
  ShieldAlert,
  ClipboardList,
  Sparkles,
  ChevronRight,
  Lock,
  Loader2,
  Key,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface LandingPageProps {
  onNavigateStudentLogin: () => void;
  onNavigateStudentSignUp: () => void;
  onNavigateWardenLogin: () => void;
  onNavigateWardenSignUp: () => void;
  onNavigateAdminLogin: () => void;
  onNavigateAdminSignUp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateStudentLogin,
  onNavigateStudentSignUp,
  onNavigateWardenLogin,
  onNavigateWardenSignUp,
  onNavigateAdminLogin,
  onNavigateAdminSignUp,
}) => {
  const { loginWithDemo } = useAuth();
  const [demoLoadingRole, setDemoLoadingRole] = useState<string | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleDemoSignIn = async (role: 'student' | 'warden' | 'admin') => {
    setDemoLoadingRole(role);
    setDemoError(null);
    try {
      const res = await loginWithDemo(role);
      if (!res.success) {
        setDemoError(res.message || `Failed to sign in with demo ${role} account.`);
      }
    } catch (err: any) {
      setDemoError(err.message || 'Demo login failed.');
    } finally {
      setDemoLoadingRole(null);
    }
  };
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/30">
            H
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black text-white tracking-tight">HostelCore</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Enterprise v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Campus Residence & Operations Management</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Residence System Active</span>
          </div>
        </div>
      </header>

      {/* Hero Intro */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center">
        <div className="text-center max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-semibold mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Role-Segregated Authentication Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Hostel Management System
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Select your dedicated campus residence portal below to sign in or register your account.
          </p>

          {/* Quick Demo Access Bar */}
          <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-3xl mx-auto text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Quick Demo Testing Accounts</span>
              </div>
              <span className="text-[11px] text-slate-400">Pre-seeded with live campus data</span>
            </div>

            {demoError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                {demoError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Student demo button */}
              <button
                type="button"
                onClick={() => handleDemoSignIn('student')}
                disabled={demoLoadingRole !== null}
                className="p-2.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/30 hover:border-blue-400 text-left transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center justify-between text-xs font-bold text-blue-300 mb-1">
                  <div className="flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student Resident</span>
                  </div>
                  {demoLoadingRole === 'student' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  ) : (
                    <ArrowRight className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
                <div className="text-[11px] text-slate-300 font-mono">student.demo@campus.edu</div>
                <div className="text-[10px] text-slate-400">Pass: student123 &bull; Aarav Sharma</div>
              </button>

              {/* Warden demo button */}
              <button
                type="button"
                onClick={() => handleDemoSignIn('warden')}
                disabled={demoLoadingRole !== null}
                className="p-2.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-1">
                  <div className="flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Hostel Warden</span>
                  </div>
                  {demoLoadingRole === 'warden' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
                <div className="text-[11px] text-slate-300 font-mono">warden.demo@campus.edu</div>
                <div className="text-[10px] text-slate-400">Pass: warden123 &bull; Prof. Rajesh Sharma</div>
              </button>

              {/* Admin demo button */}
              <button
                type="button"
                onClick={() => handleDemoSignIn('admin')}
                disabled={demoLoadingRole !== null}
                className="p-2.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/30 hover:border-purple-400 text-left transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center justify-between text-xs font-bold text-purple-300 mb-1">
                  <div className="flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>System Admin</span>
                  </div>
                  {demoLoadingRole === 'admin' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  ) : (
                    <ArrowRight className="w-3 h-3 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
                <div className="text-[11px] text-slate-300 font-mono">admin.demo@campus.edu</div>
                <div className="text-[10px] text-slate-400">Pass: admin123 &bull; Dr. Vikramaditya Sen</div>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Dedicated Role Cards (Student, Warden, Admin) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {/* Card 1: Student Portal (Blue Theme) */}
          <div className="rounded-3xl bg-slate-900/80 border border-blue-500/20 p-6 flex flex-col justify-between hover:border-blue-500/50 hover:bg-slate-900 transition-all group shadow-xl hover:shadow-blue-500/10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Student Portal
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                Student Residents
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Hostel room allocation, transfer requests, digital leave passes, fee receipts, and resident support.
              </p>

              {/* Demo Account Box */}
              <div className="mb-5 p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/25 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Demo Resident</div>
                  <div className="text-[11px] text-slate-300 font-mono">student.demo@campus.edu</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('student')}
                  disabled={demoLoadingRole !== null}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center space-x-1"
                >
                  {demoLoadingRole === 'student' ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>1-Click</span>}
                </button>
              </div>

              <div className="space-y-2 mb-6 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                <div className="flex items-center space-x-2">
                  <BedDouble className="w-3.5 h-3.5 text-blue-400" />
                  <span>Room & bed allocation view</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-blue-400" />
                  <span>Mess attendance & meal log</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
                  <span>Night-out & gate pass requests</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={onNavigateStudentLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 inline-flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Student Sign In</span>
              </button>

              <button
                onClick={onNavigateStudentSignUp}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold inline-flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Student Sign Up</span>
              </button>
            </div>
          </div>

          {/* Card 2: Warden Portal (Green/Emerald Theme) */}
          <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/20 p-6 flex flex-col justify-between hover:border-emerald-500/50 hover:bg-slate-900 transition-all group shadow-xl hover:shadow-emerald-500/10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Warden Portal
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                Hostel Wardens
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Hostel floor command, roll-call attendance, leave authorizations, room audits, and food waste insights.
              </p>

              {/* Demo Account Box */}
              <div className="mb-5 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/25 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Demo Warden</div>
                  <div className="text-[11px] text-slate-300 font-mono">warden.demo@campus.edu</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('warden')}
                  disabled={demoLoadingRole !== null}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center space-x-1"
                >
                  {demoLoadingRole === 'warden' ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>1-Click</span>}
                </button>
              </div>

              <div className="space-y-2 mb-6 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Leave & gate pass authorization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hostel block occupancy & audits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kitchen waste tracking & report</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={onNavigateWardenLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 inline-flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Warden Sign In</span>
              </button>

              <button
                onClick={onNavigateWardenSignUp}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold inline-flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Warden Sign Up</span>
              </button>
            </div>
          </div>

          {/* Card 3: Admin Portal (Dark Professional / Purple Theme) */}
          <div className="rounded-3xl bg-slate-900/80 border border-purple-500/20 p-6 flex flex-col justify-between hover:border-purple-500/50 hover:bg-slate-900 transition-all group shadow-xl hover:shadow-purple-500/10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Admin Portal
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                System Administration
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Central governance, automated room allotments, financial ledger dues, staff provisioning, and AI forecasting.
              </p>

              {/* Demo Account Box */}
              <div className="mb-5 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/25 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Demo Admin</div>
                  <div className="text-[11px] text-slate-300 font-mono">admin.demo@campus.edu</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('admin')}
                  disabled={demoLoadingRole !== null}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center space-x-1"
                >
                  {demoLoadingRole === 'admin' ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>1-Click</span>}
                </button>
              </div>

              <div className="space-y-2 mb-6 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hostel & room inventory management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Fee ledgers & audit security logs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Predictive food waste models</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={onNavigateAdminLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 inline-flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Admin Sign In</span>
              </button>

              <button
                onClick={onNavigateAdminSignUp}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold inline-flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Admin Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <p>HostelCore &bull; Campus Residence Management System &copy; {new Date().getFullYear()}</p>
        <div className="flex items-center space-x-4">
          <button onClick={onNavigateStudentLogin} className="hover:text-blue-400 transition-colors">
            Student Portal
          </button>
          <span>&bull;</span>
          <button onClick={onNavigateWardenLogin} className="hover:text-emerald-400 transition-colors">
            Warden Wing
          </button>
          <span>&bull;</span>
          <button onClick={onNavigateAdminLogin} className="hover:text-purple-400 transition-colors">
            Admin Governance
          </button>
        </div>
      </footer>
    </div>
  );
};
