import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, X, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { api } from '../../services/apiClient.ts';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  roleTheme?: 'blue' | 'emerald' | 'purple';
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  roleTheme = 'blue',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Please enter your registered institutional email address.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await api.forgotPassword(email.trim());
      setStatus({
        type: 'success',
        message: res.message || 'Password reset link dispatched. Please check your inbox.',
      });
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'Failed to dispatch reset email. Please try again or contact IT support.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAccentColor = () => {
    switch (roleTheme) {
      case 'emerald':
        return {
          btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          focus: 'focus:border-emerald-500 focus:ring-emerald-500/20',
        };
      case 'purple':
        return {
          btn: 'bg-purple-600 hover:bg-purple-500 text-white',
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          focus: 'focus:border-purple-500 focus:ring-purple-500/20',
        };
      default:
        return {
          btn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          focus: 'focus:border-indigo-500 focus:ring-indigo-500/20',
        };
    }
  };

  const colors = getAccentColor();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Reset Your Password</h3>
            <p className="text-xs text-slate-500">Enter your registered email to receive reset instructions</p>
          </div>
        </div>

        {status && (
          <div
            className={`p-3.5 rounded-2xl mb-4 text-xs flex items-start space-x-2.5 ${
              status.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">{status.message}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g., student@campus.edu or name@hostel.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden ${colors.focus} transition-all`}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md inline-flex items-center space-x-2 cursor-pointer transition-all disabled:opacity-50 ${colors.btn}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
