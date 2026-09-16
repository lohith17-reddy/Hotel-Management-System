import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Building2,
  Sliders,
  Database,
  Cpu,
  Key,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ForgotPasswordModal } from './ForgotPasswordModal.tsx';

interface AdminLoginPageProps {
  onNavigateSignUp: () => void;
  onNavigateLanding: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigateSignUp,
  onNavigateLanding,
  onLoginSuccess,
}) => {
  const { loginAsAdmin, loginWithDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleFillDemo = () => {
    setEmail('admin.demo@campus.edu');
    setPassword('admin123');
    setError(null);
  };

  const handleOneClickDemo = async () => {
    setDemoLoading(true);
    setError(null);
    try {
      const res = await loginWithDemo('admin');
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.message || 'Failed to sign in with demo administrator account.');
      }
    } catch (err: any) {
      setError(err.message || 'Demo admin login failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your administrator email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await loginAsAdmin(email.trim(), password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.message || 'Invalid administrator credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={onNavigateLanding}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Portals Overview</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-300">Central Administration Portal</span>
        </div>
      </header>

      {/* Center Auth Container */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex items-center justify-center">
        <div className="w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Visual Sidebar (Dark Professional Theme) */}
          <div className="md:col-span-5 bg-linear-to-br from-slate-900 via-purple-950/70 to-slate-950 p-8 border-r border-slate-800 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-500/30">
                Institutional Governance
              </span>
              <h2 className="text-2xl font-black text-white mt-3 tracking-tight">
                Admin Sign In
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Full-tier system administration, hostel block allocation, financial reconciliations, staff provisioning, and AI analytics.
              </p>
            </div>

            <div className="relative z-10 my-8 space-y-3.5">
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span>Hostel wing creation & capacity management</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
                  <Database className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span>Fee ledgers, payment tracking, & audit records</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span>AI kitchen waste forecasting & analytics engine</span>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Security Level: Tier 1 Root</span>
              <span>HostelCore Gov</span>
            </div>
          </div>

          {/* Right Login Form */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-slate-900/60">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">Executive Administrator Sign In</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your administrative credentials to access the central governance console.
              </p>
            </div>

            {/* Demo System Administrator Access Card */}
            <div className="mb-5 p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-600 text-white">
                    Demo Admin
                  </span>
                  <span className="text-xs font-bold text-purple-100">Dr. Vikramaditya Sen</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  admin.demo@campus.edu &bull; pass: <span className="font-semibold text-purple-300">admin123</span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                  title="Auto-fill email and password into form"
                >
                  Auto-Fill
                </button>
                <button
                  type="button"
                  onClick={handleOneClickDemo}
                  disabled={demoLoading}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  title="Sign in instantly with demo administrator"
                >
                  {demoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldAlert className="w-3 h-3" />}
                  <span>1-Click Sign In</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Administrator Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. admin@campus.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-white text-sm focus:outline-hidden focus:border-purple-500 focus:ring-3 focus:ring-purple-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-white text-sm focus:outline-hidden focus:border-purple-500 focus:ring-3 focus:ring-purple-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-700 bg-slate-950"
                  />
                  <span>Secure administrative session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 inline-flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Security Protocol...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Executive Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Link to Admin Registration */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Authorized administrator provisioning?{' '}
                <button
                  type="button"
                  onClick={onNavigateSignUp}
                  className="font-bold text-purple-400 hover:text-purple-300 hover:underline cursor-pointer ml-1"
                >
                  Register Admin Account &rarr;
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 py-4 text-center text-xs text-slate-500">
        Campus Residence & Hostel Services &bull; Central Administrative Authority
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={email}
        roleTheme="purple"
      />
    </div>
  );
};
