import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  AlertCircle,
  Building2,
  BedDouble,
  LogOut,
  History,
  Sparkles,
  Plus
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { Allocation, RoomTransfer, Hostel, Block, Room, Bed, Student } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface AllocationsViewProps {
  isStudentMyRoomView?: boolean;
}

export const AllocationsView: React.FC<AllocationsViewProps> = ({ isStudentMyRoomView = false }) => {
  const { currentUser, currentStudent, currentAllocation, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<'allocations' | 'transfers'>(isStudentMyRoomView ? 'allocations' : 'allocations');
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [transfers, setTransfers] = useState<RoomTransfer[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [rooms, setRooms] = useState<(Room & { beds?: Bed[] })[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [showAllocateModal, setShowAllocateModal] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);

  // Allocate Form
  const [allocForm, setAllocForm] = useState({
    studentId: '',
    hostelId: '',
    blockId: '',
    roomId: '',
    bedId: '',
    reason: 'Academic Term Allocation',
  });

  // Transfer Form
  const [transferForm, setTransferForm] = useState({
    newHostelId: '',
    newBlockId: '',
    newRoomId: '',
    newBedId: '',
    reason: '',
  });

  const fetchData = async () => {
    try {
      const [aRes, tRes, hRes, bRes, rRes, sRes] = await Promise.all([
        api.getAllocations(),
        api.getTransfers(),
        api.getHostels(),
        api.getBlocks(),
        api.getRooms(),
        api.getStudents(),
      ]);
      if (aRes.success) setAllocations(aRes.allocations);
      if (tRes.success) setTransfers(tRes.transfers);
      if (hRes.success) {
        setHostels(hRes.hostels);
        if (hRes.hostels.length > 0) {
          setAllocForm(prev => ({ ...prev, hostelId: hRes.hostels[0].id }));
          setTransferForm(prev => ({ ...prev, newHostelId: hRes.hostels[0].id }));
        }
      }
      if (bRes.success) setBlocks(bRes.blocks);
      if (rRes.success) setRooms(rRes.rooms);
      if (sRes.success) setStudents(sRes.students);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.allocateStudent({
        ...allocForm,
        allocatedBy: currentUser?.name || 'Administrator',
      });
      if (res.success) {
        setShowAllocateModal(false);
        fetchData();
        refreshUserData();
      }
    } catch (err: any) {
      alert(err.message || 'Error creating allocation');
    }
  };

  const handleDeallocate = async (allocationId: string) => {
    const reason = prompt('Enter reason for room deallocation (e.g. Course completion, student withdrew):');
    if (!reason) return;
    try {
      const res = await api.deallocateStudent(allocationId, currentUser?.name || 'Admin', reason);
      if (res.success) {
        fetchData();
        refreshUserData();
      }
    } catch (err: any) {
      alert(err.message || 'Error deallocating bed');
    }
  };

  const handleRequestTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    try {
      const res = await api.requestTransfer({
        studentId: currentStudent.id,
        newHostelId: transferForm.newHostelId,
        newBlockId: transferForm.newBlockId,
        newRoomId: transferForm.newRoomId,
        newBedId: transferForm.newBedId,
        reason: transferForm.reason,
        requestedBy: currentUser?.name || 'Student',
      });
      if (res.success) {
        setShowTransferModal(false);
        fetchData();
        alert('Transfer request submitted to warden for review.');
      }
    } catch (err: any) {
      alert(err.message || 'Error requesting transfer');
    }
  };

  const handleApproveTransfer = async (id: string) => {
    if (!confirm('Approve this room transfer and reallocate student to the new bed?')) return;
    try {
      const res = await api.approveTransfer(id, currentUser?.name || 'Warden');
      if (res.success) {
        fetchData();
        refreshUserData();
      }
    } catch (err: any) {
      alert(err.message || 'Error approving transfer');
    }
  };

  const handleRejectTransfer = async (id: string) => {
    const reason = prompt('Enter reason for rejecting transfer request:');
    if (reason === null) return;
    try {
      const res = await api.rejectTransfer(id, currentUser?.name || 'Warden', reason);
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error rejecting transfer');
    }
  };

  // If Student "My Room" Mode
  if (isStudentMyRoomView) {
    const myTransfers = transfers.filter(t => t.studentId === currentStudent?.id);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Room & Bed Allocation</h1>
            <p className="text-xs text-slate-500">Your registered residential accommodation and transfer management</p>
          </div>

          {currentAllocation && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Request Room Transfer</span>
            </button>
          )}
        </div>

        {/* Active Room Card */}
        {currentAllocation ? (
          <div className="bg-gradient-to-tr from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-indigo-500/20">
            <div className="flex items-center justify-between pb-4 border-b border-indigo-800/60">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
                  {currentAllocation.roomNumber}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold">{currentAllocation.roomNumber} ({currentAllocation.bedNumber})</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      Active Resident
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 mt-0.5">{currentAllocation.hostelName} • {currentAllocation.blockName}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Allocation Date</span>
                <span className="font-semibold text-white block mt-0.5">
                  {new Date(currentAllocation.allocationDate).toLocaleDateString()}
                </span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Check-In Time</span>
                <span className="font-semibold text-white block mt-0.5">
                  {currentAllocation.checkInDate ? new Date(currentAllocation.checkInDate).toLocaleDateString() : 'Verified'}
                </span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Allocated By</span>
                <span className="font-semibold text-white block mt-0.5">{currentAllocation.allocatedBy}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Registration No</span>
                <span className="font-semibold text-white block mt-0.5">{currentAllocation.registrationNumber}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
            <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No active room allocation found</h3>
            <p className="text-xs text-slate-500 mt-1">Please contact your hostel warden for bed assignment.</p>
          </div>
        )}

        {/* My Transfer Requests History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">My Room Transfer Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Current Room</th>
                  <th className="px-4 py-3">Requested Target</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400">No transfer requests submitted yet.</td>
                  </tr>
                ) : (
                  myTransfers.map(tr => (
                    <tr key={tr.id}>
                      <td className="px-4 py-3">{new Date(tr.requestDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium">{tr.oldRoomNumber} ({tr.oldBedNumber})</td>
                      <td className="px-4 py-3 font-semibold text-indigo-700">{tr.newRoomNumber} ({tr.newBedNumber})</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs">{tr.reason}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tr.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          tr.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {tr.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: REQUEST TRANSFER */}
        {showTransferModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Request Room Transfer</h3>
                <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>

              <form onSubmit={handleRequestTransfer} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Hostel</label>
                  <select
                    value={transferForm.newHostelId}
                    onChange={e => {
                      const hId = e.target.value;
                      const hBlocks = blocks.filter(b => b.hostelId === hId);
                      setTransferForm({ ...transferForm, newHostelId: hId, newBlockId: hBlocks[0]?.id || '' });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  >
                    {hostels.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Block</label>
                  <select
                    value={transferForm.newBlockId}
                    onChange={e => setTransferForm({ ...transferForm, newBlockId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  >
                    {blocks.filter(b => b.hostelId === transferForm.newHostelId).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Room & Vacant Bed</label>
                  <select
                    value={transferForm.newBedId}
                    onChange={e => {
                      const bedId = e.target.value;
                      // find room
                      for (const r of rooms) {
                        const b = r.beds?.find(bed => bed.id === bedId);
                        if (b) {
                          setTransferForm({ ...transferForm, newBedId: bedId, newRoomId: r.id });
                          break;
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  >
                    <option value="">-- Choose Vacant Bed --</option>
                    {rooms
                      .filter(r => r.hostelId === transferForm.newHostelId && (!transferForm.newBlockId || r.blockId === transferForm.newBlockId))
                      .flatMap(r => (r.beds || []).filter(b => b.status === 'available').map(b => ({ ...b, roomNumber: r.roomNumber })))
                      .map(bed => (
                        <option key={bed.id} value={bed.id}>
                          Room {bed.roomNumber} — {bed.bedNumber} (Vacant)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Transfer</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Need quiet environment for exam preparation, closer to department lab, etc."
                    value={transferForm.reason}
                    onChange={e => setTransferForm({ ...transferForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                  >
                    Submit Transfer Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin & Warden Allocations Management View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bed Allocations & Room Transfers</h1>
          <p className="text-xs text-slate-500">Manage resident bed assignments, check-ins, deallocations, and transfers</p>
        </div>

        <div className="flex items-center space-x-2">
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setShowAllocateModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Bed Allocation</span>
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('allocations')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'allocations' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active & Historic Allocations ({allocations.length})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'transfers' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Room Transfer Requests</span>
          {transfers.filter(t => t.status === 'pending').length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
              {transfers.filter(t => t.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'allocations' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Registration No</th>
                  <th className="px-4 py-3">Hostel / Wing</th>
                  <th className="px-4 py-3">Room & Bed</th>
                  <th className="px-4 py-3">Allocated Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.map(al => (
                  <tr key={al.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{al.studentName}</td>
                    <td className="px-4 py-3 text-slate-600">{al.registrationNumber || 'REG-PENDING'}</td>
                    <td className="px-4 py-3">
                      <div>{al.hostelName}</div>
                      <span className="text-[10px] text-slate-400">{al.blockName}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-indigo-900">
                      {al.roomNumber} — <span className="font-bold">{al.bedNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(al.allocationDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        al.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        al.status === 'transferred' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {al.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {al.status === 'active' && (
                        <button
                          onClick={() => handleDeallocate(al.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Deallocate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TRANSFERS QUEUE */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Request Date</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Current Bed</th>
                  <th className="px-4 py-3">Target Bed Requested</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400">No transfer requests pending.</td>
                  </tr>
                ) : (
                  transfers.map(tr => (
                    <tr key={tr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-slate-500">{new Date(tr.requestDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{tr.studentName}</td>
                      <td className="px-4 py-3 text-slate-700">{tr.oldRoomNumber} ({tr.oldBedNumber})</td>
                      <td className="px-4 py-3 font-bold text-indigo-700">{tr.newRoomNumber} ({tr.newBedNumber})</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs">{tr.reason}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tr.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          tr.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {tr.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {tr.status === 'pending' && (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleApproveTransfer(tr.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectTransfer(tr.id)}
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
      )}

      {/* MODAL: ALLOCATE STUDENT */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Allocate Student to Bed</h3>
              <button onClick={() => setShowAllocateModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAllocate} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
                <select
                  value={allocForm.studentId}
                  onChange={e => setAllocForm({ ...allocForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.registrationNumber} • {st.department} (Year {st.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Building</label>
                <select
                  value={allocForm.hostelId}
                  onChange={e => {
                    const hId = e.target.value;
                    const hBlocks = blocks.filter(b => b.hostelId === hId);
                    setAllocForm({ ...allocForm, hostelId: hId, blockId: hBlocks[0]?.id || '' });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                >
                  {hostels.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Block / Wing</label>
                <select
                  value={allocForm.blockId}
                  onChange={e => setAllocForm({ ...allocForm, blockId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                >
                  {blocks.filter(b => b.hostelId === allocForm.hostelId).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vacant Bed</label>
                <select
                  value={allocForm.bedId}
                  onChange={e => {
                    const bedId = e.target.value;
                    for (const r of rooms) {
                      const b = r.beds?.find(bed => bed.id === bedId);
                      if (b) {
                        setAllocForm({ ...allocForm, bedId, roomId: r.id });
                        break;
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                >
                  <option value="">-- Choose Vacant Bed --</option>
                  {rooms
                    .filter(r => r.hostelId === allocForm.hostelId && (!allocForm.blockId || r.blockId === allocForm.blockId))
                    .flatMap(r => (r.beds || []).filter(b => b.status === 'available').map(b => ({ ...b, roomNumber: r.roomNumber })))
                    .map(bed => (
                      <option key={bed.id} value={bed.id}>
                        Room {bed.roomNumber} — {bed.bedNumber} (Vacant)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
