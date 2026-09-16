import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  UtensilsCrossed,
  Sparkles,
  Info,
  MapPin,
  Phone
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { LeaveRequest } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export const LeavesView: React.FC = () => {
  const { currentUser, currentStudent } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newLeaveForm, setNewLeaveForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toISOString().split('T')[0];
    })(),
    reason: '',
    destination: '',
    emergencyContact: '',
  });

  const fetchData = async () => {
    try {
      const res = await api.getLeaves();
      if (res.success) {
        setLeaves(res.leaves);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLeaves = leaves.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (currentUser?.role === 'student' && currentStudent && l.studentId !== currentStudent.id) {
      return false;
    }
    return true;
  });

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createLeave({
        ...newLeaveForm,
        studentId: currentStudent?.id || 's-1',
        studentName: currentUser?.name || 'Rohan Verma',
      });
      if (res.success) {
        setShowApplyModal(false);
        setNewLeaveForm({
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reason: '',
          destination: '',
          emergencyContact: '',
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting leave application');
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve outstation leave? Note: This will automatically deduct the student from mess attendance predictions for the approved dates.')) return;
    try {
      const res = await api.approveLeave(id, currentUser?.id || 'u-warden-1', currentUser?.name || 'Prof. Rajesh Sharma');
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error approving leave');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      const res = await api.rejectLeave(id, currentUser?.name || 'Warden');
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error rejecting leave');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Outstation Leave & Gate Pass Requests</h1>
          <p className="text-xs text-slate-500">
            Warden digital approvals seamlessly synced with AI Mess Attendance Forecasting
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Outstation Leave</span>
        </button>
      </div>

      {/* SYNC NOTIFICATION BANNER */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center space-x-3 text-xs text-emerald-900 shadow-2xs">
        <div className="p-2 bg-emerald-600 text-white rounded-xl flex-shrink-0">
          <UtensilsCrossed className="w-4 h-4" />
        </div>
        <div>
          <strong className="font-bold">Automated Mess Headcount Linkage:</strong> Whenever a student's leave is approved, the system immediately decrements the predicted mess attendance and recalculates daily kitchen preparation batch targets.
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
        <span className="text-xs text-slate-500 font-medium">Status Filter:</span>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800"
        >
          <option value="all">All Leave Requests</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* LEAVES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Resident</th>
                <th className="px-4 py-3">Date Range</th>
                <th className="px-4 py-3">Destination / Reason</th>
                <th className="px-4 py-3">Emergency Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">No leave requests found.</td>
                </tr>
              ) : (
                filteredLeaves.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{l.studentName}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {l.startDate} to {l.endDate}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs">
                      <div className="font-semibold text-slate-900">{l.destination}</div>
                      <span className="text-[10px] text-slate-400">{l.reason}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{l.emergencyContact || 'On file'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        l.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        l.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(currentUser?.role === 'admin' || currentUser?.role === 'warden') && l.status === 'pending' && (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleApprove(l.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(l.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: APPLY LEAVE */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Apply for Outstation Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleApplyLeave} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newLeaveForm.startDate}
                    onChange={e => setNewLeaveForm({ ...newLeaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newLeaveForm.endDate}
                    onChange={e => setNewLeaveForm({ ...newLeaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Address / City</label>
                <input
                  type="text"
                  placeholder="e.g. Pune, Maharashtra (Home)"
                  value={newLeaveForm.destination}
                  onChange={e => setNewLeaveForm({ ...newLeaveForm, destination: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 982-3045 (Parent)"
                  value={newLeaveForm.emergencyContact}
                  onChange={e => setNewLeaveForm({ ...newLeaveForm, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
                <textarea
                  rows={2}
                  placeholder="State reason clearly for warden approval..."
                  value={newLeaveForm.reason}
                  onChange={e => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
