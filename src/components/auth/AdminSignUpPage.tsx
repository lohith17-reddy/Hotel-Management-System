import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  User,
  Building,
  Key,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';

interface AdminSignUpPageProps {
  onNavigateLogin: () => void;
  onNavigateLanding: () => void;
  onRegisteredSuccess?: () => void;
}

export const AdminSignUpPage: React.FC<AdminSignUpPageProps> = ({
  onNavigateLogin,
  onNavigateLanding,
  onRegisteredSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    adminId: '',
    organization: 'Directorate of Student Affairs & Residence Management',
    password: '',
    confirmPassword: '',
    securityAccessCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCodeHint, setShowCodeHint] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.adminId.trim()) {
      setError('Please fill in your full name, email, and Admin ID.');
      return;
    }

    if (!formData.securityAccessCode.trim()) {
      setError('Security Access Code is required to provision administrative accounts.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.adminSignUp(formData);
      if (res.success) {
        setSuccessMessage('Administrator account provisioned successfully! Redirecting to Admin Sign In...');
        setTimeout(() => {
          if (onRegisteredSuccess) {
            onRegisteredSuccess();
          } else {
            onNavigateLogin();
          }
        }, 1500);
      } else {
        setError(res.message || 'Provisioning failed. Please check your security code and details.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your network connection.');
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
          <span className="text-xs font-bold text-slate-300">Administrator Provisioning</span>
        </div>
      </header>

      {/* Main Registration Box */}
      <div className="relative z-10 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex items-center justify-center">
        <div className="w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-8 sm:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Admin Registration</h2>
                <p className="text-xs text-slate-400">Provision a high-clearance administrative governance account</p>
              </div>
            </div>

            <button
              onClick={onNavigateLogin}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 self-start sm:self-center cursor-pointer"
            >
              Existing Admin? Sign In &rarr;
            </button>
          </div>

          {/* Feedback */}
          {error && (
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="mt-5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Security Access Code Notice */}
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/50">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-400" />
                  <span>Security Access Code</span>
                  <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCodeHint(!showCodeHint)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showCodeHint ? 'Hide Key Info' : 'Master Key Info'}</span>
                </button>
              </div>

              {showCodeHint && (
                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  To prevent unauthorized administrator creation, a campus master key is required. Authorized master key code: <span className="font-mono text-purple-300 font-bold">HOSTEL-ADMIN-2025</span> or <span className="font-mono text-purple-300 font-bold">ADMIN2025</span>.
                </p>
              )}

              <input
                type="password"
                required
                name="securityAccessCode"
                value={formData.securityAccessCode}
                onChange={handleChange}
                placeholder="Enter Institutional Security Key (e.g. HOSTEL-ADMIN-2025)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-800/60 bg-slate-950/80 text-white text-sm focus:outline-hidden focus:border-purple-400 focus:ring-3 focus:ring-purple-500/20 transition-all font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Lohith Sagar Reddy"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-950/70 text-white text-sm focus:outline-hidden focus:border-purple-500 focus:ring-3 focus:ring-purple-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Administrator Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. admin@campus.edu"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-950/70 text-white text-sm focus:outline-hidden focus:border-purple-500 focus:ring-3 focus:ring-purple-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 234-5678"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-950/70 text-white text-sm focus:outline-hidden focus:border-purple-500 focus:ring-3 focus:ring-purple-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Admin ID / Clearance ID <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    name="adminId"
                    value={formData.adminId}
                    onChange={handleChange}
                    placeholder="e.g. ADM-DIR-002"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-950/70 text-white text-sm focus:outline-hidden focus:border-purple-500 focus:ring-3 focus:ring-purple-500/20 transition-all placeholder:text-slate-600 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Organization / Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Directorate of Student Affairs & Residence Management"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-950/70 text-white text-sm focus:outline-hidden focus:border-purple-500 focus:ring-3 focus:ring-purple-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-950/70 text-white text-sm focus:outline-hidden focus:border-purple-500 focus:ring-3 focus:ring-purple-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-950/70 text-white text-sm focus:outline-hidden focus:border-purple-500 focus:ring-3 focus:ring-purple-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                All administrative provisioning activities are logged in the cryptographic audit trail.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 inline-flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Provisioning Admin...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Admin Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 py-4 text-center text-xs text-slate-500">
        Campus Residence & Hostel Services &bull; Central Administrative Directorate
      </footer>
    </div>
  );
};
