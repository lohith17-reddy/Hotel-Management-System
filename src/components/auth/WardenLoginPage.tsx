import React, { useState } from 'react';
import {
  UserCheck,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ClipboardList,
  Utensils,
  DoorOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ForgotPasswordModal } from './ForgotPasswordModal.tsx';

interface WardenLoginPageProps {
  onNavigateSignUp: () => void;
  onNavigateLanding: () => void;
  onLoginSuccess: () => void;
}

export const WardenLoginPage: React.FC<WardenLoginPageProps> = ({
  onNavigateSignUp,
  onNavigateLanding,
  onLoginSuccess,
}) => {
  const { loginAsWarden, loginWithDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleFillDemo = () => {
    setEmail('warden.demo@campus.edu');
    setPassword('warden123');
    setError(null);
  };

  const handleOneClickDemo = async () => {
    setDemoLoading(true);
    setError(null);
    try {
      const res = await loginWithDemo('warden');
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.message || 'Failed to sign in with demo warden account.');
      }
    } catch (err: any) {
      setError(err.message || 'Demo warden login failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your warden staff email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await loginAsWarden(email.trim(), password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.message || 'Invalid warden credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="max-w-6xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={onNavigateLanding}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Portals Overview</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">Warden Floor Command Portal</span>
        </div>
      </header>

      {/* Center Auth Container */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Visual Sidebar (Emerald/Green Theme) */}
          <div className="md:col-span-5 bg-linear-to-br from-emerald-700 via-teal-800 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-6 shadow-inner">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-200 bg-emerald-500/30 px-2.5 py-1 rounded-full border border-emerald-400/30">
                Staff & Residence Command
              </span>
              <h2 className="text-2xl font-black text-white mt-3 tracking-tight">
                Warden Sign In
              </h2>
              <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
                Hostel block supervision, daily roll-calls, gate pass approvals, room inspection logs, and kitchen waste monitoring.
              </p>
            </div>

            <div className="relative z-10 my-8 space-y-3.5">
              <div className="flex items-center space-x-3 text-xs text-emerald-100">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-3.5 h-3.5 text-emerald-200" />
                </div>
                <span>Night-out & emergency leave authorization</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-emerald-100">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <DoorOpen className="w-3.5 h-3.5 text-emerald-200" />
                </div>
                <span>Room audits, occupancy, & bed assignments</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-emerald-100">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Utensils className="w-3.5 h-3.5 text-emerald-200" />
                </div>
                <span>Mess attendance & AI food waste dashboard</span>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/15 text-[11px] text-emerald-200 flex items-center justify-between">
              <span>Campus Security Network</span>
              <span>HostelCore Secure</span>
            </div>
          </div>

          {/* Right Login Form */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Warden Authentication</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your warden credentials to access the block management console.
              </p>
            </div>

            {/* Demo Hostel Warden Access Card */}
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                    Demo Warden
                  </span>
                  <span className="text-xs font-bold text-slate-900">Prof. Rajesh Sharma</span>
                </div>
                <p className="text-[11px] text-slate-600 font-mono">
                  warden.demo@campus.edu &bull; pass: <span className="font-semibold text-slate-800">warden123</span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  title="Auto-fill email and password into form"
                >
                  Auto-Fill
                </button>
                <button
                  type="button"
                  onClick={handleOneClickDemo}
                  disabled={demoLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  title="Sign in instantly with demo warden"
                >
                  {demoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                  <span>1-Click Sign In</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Warden Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. warden.boys@campus.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/15 transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/15 transition-all text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Keep session authenticated</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 inline-flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Warden Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Warden Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Link to Warden Registration */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                New warden staff member?{' '}
                <button
                  type="button"
                  onClick={onNavigateSignUp}
                  className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer ml-1"
                >
                  Register Warden Profile &rarr;
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-4 text-center text-xs text-slate-400">
        Campus Residence & Hostel Services &bull; Warden Security Authority
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={email}
        roleTheme="emerald"
      />
    </div>
  );
};
