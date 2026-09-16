import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Clock,
  LogOut,
  CheckCircle2,
  Phone,
  Building2,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { Visitor } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export const VisitorsView: React.FC = () => {
  const { currentUser, currentStudent } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [newVisitorForm, setNewVisitorForm] = useState({
    visitorName: '',
    phone: '',
    idProofNumber: '',
    studentId: 's-1',
    studentName: 'Rohan Verma',
    studentRoom: 'A-101',
    purpose: 'Parent meeting & luggage delivery',
    relationship: 'Father',
  });

  const fetchData = async () => {
    try {
      const res = await api.getVisitors();
      if (res.success) {
        setVisitors(res.visitors);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredVisitors = visitors.filter(v => {
    if (currentUser?.role === 'student' && currentStudent && v.studentId !== currentStudent.id) {
      return false;
    }
    return true;
  });

  const handleCreatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createVisitor({
        ...newVisitorForm,
        studentId: currentStudent?.id || newVisitorForm.studentId,
        studentName: currentUser?.name || newVisitorForm.studentName,
        approvedBy: currentUser?.name || 'Gate Security',
      });
      if (res.success) {
        setShowAddModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error generating visitor pass');
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      const res = await api.checkoutVisitor(id);
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error checking out visitor');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Visitor & Guest Passes</h1>
          <p className="text-xs text-slate-500">Track entry timestamps, ID verification & active visitors on campus</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Visitor Pass</span>
        </button>
      </div>

      {/* VISITORS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Visitor Name</th>
                <th className="px-4 py-3">Relationship</th>
                <th className="px-4 py-3">Resident Visited</th>
                <th className="px-4 py-3">Entry Time</th>
                <th className="px-4 py-3">Exit Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">No visitor records logged today.</td>
                </tr>
              ) : (
                filteredVisitors.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>{v.visitorName}</div>
                      <span className="text-[10px] text-slate-400 font-normal">ID: {v.idProofNumber || 'Verified'} • {v.phone}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{v.relationship || 'Guest'}</td>
                    <td className="px-4 py-3 font-medium text-indigo-900">
                      {v.studentName} ({v.studentRoom || 'Room A-101'})
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {v.exitTime ? new Date(v.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        v.status === 'checked_in' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {v.status === 'checked_in' && (
                        <button
                          onClick={() => handleCheckOut(v.id)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Mark Check-Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: GENERATE VISITOR PASS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Issue Visitor Gate Pass</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreatePass} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Verma"
                  value={newVisitorForm.visitorName}
                  onChange={e => setNewVisitorForm({ ...newVisitorForm, visitorName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98220 12345"
                    value={newVisitorForm.phone}
                    onChange={e => setNewVisitorForm({ ...newVisitorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    placeholder="e.g. Parent, Sibling"
                    value={newVisitorForm.relationship}
                    onChange={e => setNewVisitorForm({ ...newVisitorForm, relationship: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Government ID No</label>
                  <input
                    type="text"
                    placeholder="Aadhaar / Driving License"
                    value={newVisitorForm.idProofNumber}
                    onChange={e => setNewVisitorForm({ ...newVisitorForm, idProofNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Visiting</label>
                  <input
                    type="text"
                    value={newVisitorForm.studentRoom}
                    onChange={e => setNewVisitorForm({ ...newVisitorForm, studentRoom: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  placeholder="e.g. Document signing, personal meeting"
                  value={newVisitorForm.purpose}
                  onChange={e => setNewVisitorForm({ ...newVisitorForm, purpose: e.target.value })}
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
                  Generate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
