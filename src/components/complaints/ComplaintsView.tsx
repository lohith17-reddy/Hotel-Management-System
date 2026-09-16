import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  UserCheck,
  Zap,
  Droplets,
  Wifi,
  Hammer
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { Complaint, ComplaintCategory, Priority, ComplaintStatus } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export const ComplaintsView: React.FC = () => {
  const { currentUser, currentStudent } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isAiClassifying, setIsAiClassifying] = useState<boolean>(false);

  const [newComplaintForm, setNewComplaintForm] = useState({
    title: '',
    description: '',
    category: 'electrical' as ComplaintCategory,
    priority: 'medium' as Priority,
    roomNumber: 'A-101',
    hostelId: 'h-cvr-1',
  });

  const fetchData = async () => {
    try {
      const res = await api.getComplaints();
      if (res.success) {
        setComplaints(res.complaints);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (currentUser?.role === 'student' && currentStudent && c.studentId !== currentStudent.id) {
      return false; // Student only sees own complaints
    }
    return true;
  });

  // AI Auto-Classification on Description change
  const handleAIClassify = async () => {
    if (!newComplaintForm.description) return;
    setIsAiClassifying(true);
    try {
      const res = await api.classifyComplaintWithAI(newComplaintForm.title || 'Hostel Issue', newComplaintForm.description);
      if (res.success && res.analysis) {
        setNewComplaintForm(prev => ({
          ...prev,
          category: (res.analysis.category?.toLowerCase() || 'other') as ComplaintCategory,
          priority: (res.analysis.priority?.toLowerCase() || 'medium') as Priority,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiClassifying(false);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createComplaint({
        ...newComplaintForm,
        studentId: currentStudent?.id || 's-1',
      });
      if (res.success) {
        setShowAddModal(false);
        setNewComplaintForm({
          title: '',
          description: '',
          category: 'electrical',
          priority: 'medium',
          roomNumber: 'A-101',
          hostelId: 'h-cvr-1',
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting complaint');
    }
  };

  const handleResolveComplaint = async (id: string) => {
    const notes = prompt('Enter technician resolution notes:');
    if (!notes) return;
    try {
      const res = await api.updateComplaint(id, {
        status: 'resolved',
        resolutionNotes: notes,
      });
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error resolving ticket');
    }
  };

  const handleAssignStaff = async (id: string) => {
    const staff = prompt('Enter staff or technician name (e.g. Marcus Vance - Electrician):', 'Marcus Vance (Electrical)');
    if (!staff) return;
    try {
      const res = await api.updateComplaint(id, {
        assignedStaffName: staff,
        status: 'assigned',
      });
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error assigning staff');
    }
  };

  const getCategoryIcon = (cat: ComplaintCategory) => {
    switch (cat) {
      case 'electrical': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'plumbing': return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'internet': return <Wifi className="w-4 h-4 text-indigo-500" />;
      default: return <Hammer className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Complaints & Maintenance Ticketing</h1>
          <p className="text-xs text-slate-500">Gemini AI triage, automated priority assignment & maintenance dispatch</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lodge New Complaint</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800"
          >
            <option value="all">All Categories</option>
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
            <option value="carpentry">Carpentry</option>
            <option value="internet">Internet / Wi-Fi</option>
            <option value="cleaning">Cleaning & Hygiene</option>
          </select>
        </div>
      </div>

      {/* COMPLAINTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredComplaints.length === 0 ? (
          <div className="col-span-3 bg-white rounded-2xl p-12 text-center border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No active complaints found</h3>
            <p className="text-xs text-slate-500 mt-1">All residential facilities are running smoothly.</p>
          </div>
        ) : (
          filteredComplaints.map(c => {
            const isResolved = c.status === 'resolved';

            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-xl bg-slate-100">{getCategoryIcon(c.category)}</div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{c.title}</h3>
                        <span className="text-[10px] text-slate-400 font-medium capitalize">
                          {c.category} • Room {c.roomNumber}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      c.priority === 'urgent' || c.priority === 'high'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {c.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">{c.description}</p>

                  <div className="mt-4 p-2.5 bg-slate-50 rounded-xl text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Resident:</span>
                      <span className="font-semibold text-slate-800">{c.studentName}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Assigned To:</span>
                      <span className="font-semibold text-indigo-700">{c.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Logged On:</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    {c.resolutionNotes && (
                      <div className="pt-1.5 border-t border-slate-200 text-emerald-800 font-medium">
                        Resolution: {c.resolutionNotes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    isResolved ? 'bg-emerald-100 text-emerald-800' :
                    c.status === 'in_progress' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {c.status.replace('_', ' ')}
                  </span>

                  {(currentUser?.role === 'admin' || currentUser?.role === 'warden' || currentUser?.role === 'staff') && !isResolved && (
                    <div className="flex items-center space-x-1.5">
                      {!c.assignedTo && (
                        <button
                          onClick={() => handleAssignStaff(c.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold cursor-pointer"
                        >
                          Assign
                        </button>
                      )}
                      <button
                        onClick={() => handleResolveComplaint(c.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: LODGE COMPLAINT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Lodge Maintenance Ticket</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateComplaint} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ceiling fan regulator sparking in Room A-101"
                  value={newComplaintForm.title}
                  onChange={e => setNewComplaintForm({ ...newComplaintForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Detailed Description</label>
                  <button
                    type="button"
                    onClick={handleAIClassify}
                    disabled={isAiClassifying || !newComplaintForm.description}
                    className="text-[10px] text-indigo-600 font-bold hover:text-indigo-800 flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isAiClassifying ? 'Analyzing...' : 'AI Auto-Detect Category & Priority'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Describe the issue in detail..."
                  value={newComplaintForm.description}
                  onChange={e => setNewComplaintForm({ ...newComplaintForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newComplaintForm.category}
                    onChange={e => setNewComplaintForm({ ...newComplaintForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="internet">Internet / Wi-Fi</option>
                    <option value="cleaning">Cleaning & Hygiene</option>
                    <option value="security">Security</option>
                    <option value="mess">Mess & Food</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newComplaintForm.priority}
                    onChange={e => setNewComplaintForm({ ...newComplaintForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
                <input
                  type="text"
                  value={newComplaintForm.roomNumber}
                  onChange={e => setNewComplaintForm({ ...newComplaintForm, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
