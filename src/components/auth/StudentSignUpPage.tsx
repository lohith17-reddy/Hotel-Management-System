import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  Phone,
  User,
  Hash,
  BookOpen,
  Calendar,
  Shield,
  MapPin,
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';

interface StudentSignUpPageProps {
  onNavigateLogin: () => void;
  onNavigateLanding: () => void;
  onRegisteredSuccess?: () => void;
}

export const StudentSignUpPage: React.FC<StudentSignUpPageProps> = ({
  onNavigateLogin,
  onNavigateLanding,
  onRegisteredSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    registrationNumber: '',
    rollNumber: '',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    year: '1',
    gender: 'male' as 'male' | 'female' | 'other',
    dateOfBirth: '2005-01-01',
    guardianName: '',
    guardianPhone: '',
    address: '',
    emergencyContact: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biotechnology',
    'Data Science & AI',
    'Information Technology',
  ];

  const courses = [
    'B.Tech CSE',
    'B.Tech ECE',
    'B.Tech EE',
    'B.Tech ME',
    'B.Tech Civil',
    'B.Tech AI-DS',
    'B.Tech Biotech',
    'M.Tech',
    'MCA',
    'MBA',
    'Ph.D Research',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please provide your full name and student email.');
      return;
    }
    if (!formData.registrationNumber.trim() || !formData.rollNumber.trim()) {
      setError('Please provide your institutional Registration Number and Roll Number.');
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
      const res = await api.studentSignUp(formData);
      if (res.success) {
        setSuccessMessage('Student registration successful! Redirecting to Student Sign In...');
        setTimeout(() => {
          if (onRegisteredSuccess) {
            onRegisteredSuccess();
          } else {
            onNavigateLogin();
          }
        }, 1500);
      } else {
        setError(res.message || 'Registration failed. Please review your details.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="max-w-6xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={onNavigateLanding}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Portals Overview</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">Student Residence Registration</span>
        </div>
      </header>

      {/* Main Registration Box */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10">
          {/* Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Registration</h2>
                <p className="text-xs text-slate-500">Create your institutional student residence account</p>
              </div>
            </div>

            <button
              onClick={onNavigateLogin}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 self-start sm:self-center cursor-pointer"
            >
              Already registered? Sign In &rarr;
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{successMessage}</div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Section 1: Personal Details */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-blue-700 mb-3">
                <User className="w-3.5 h-3.5" />
                <span>1. Personal Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rohan Verma"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. rohan.verma@campus.edu"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all bg-white text-slate-900"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all text-slate-900 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Credentials */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-blue-700 mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                <span>2. Academic Credentials</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registration Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g. REG-2024-CS-109"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all text-slate-900 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Roll Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="e.g. CS24B109"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all text-slate-900 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all bg-white text-slate-900"
                  >
                    <option value="1">1st Year (Freshman)</option>
                    <option value="2">2nd Year (Sophomore)</option>
                    <option value="3">3rd Year (Junior)</option>
                    <option value="4">4th Year (Senior)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all bg-white text-slate-900"
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Degree Course</label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all bg-white text-slate-900"
                  >
                    {courses.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Guardian & Emergency Information */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-blue-700 mb-3">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>3. Guardian & Emergency Contact</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Verma"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Phone</label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    placeholder="+1 (555) 999-1122"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Number</label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="+1 (555) 999-1122"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Residential Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. Flat 402, Green Glen Towers, Sector 12, Pune"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Account Security */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-blue-700 mb-3">
                <Lock className="w-3.5 h-3.5" />
                <span>4. Account Security Password</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                By submitting, you agree to adhere to Campus Residence Codes of Conduct.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 inline-flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Student Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-4 text-center text-xs text-slate-400">
        Campus Residence & Hostel Services &bull; Student Enrollment Protocol
      </footer>
    </div>
  );
};
