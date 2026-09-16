import React, { useState, useEffect } from 'react';
import {
  Building2,
  BedDouble,
  ClipboardList,
  CalendarDays,
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  ShieldAlert,
  PhoneCall,
  UserCheck,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/apiClient.ts';
import { LeaveRequest, Complaint, Hostel, DashboardStats } from '../../types/index.ts';
import { InfoTooltip } from '../common/InfoTooltip.tsx';

interface WardenDashboardProps {
  stats: DashboardStats | null;
  setActiveTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const WardenDashboard: React.FC<WardenDashboardProps> = ({
  stats,
  setActiveTab,
  onOpenAI
}) => {
  const { currentUser } = useAuth();
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [activeComplaints, setActiveComplaints] = useState<Complaint[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Determine assigned hostel wing
  const isGirlsWarden = currentUser?.id === 'u-warden-2' || currentUser?.name?.toLowerCase().includes('sunita');
  const assignedHostelName = isGirlsWarden ? 'Sarojini Naidu Girls Hostel (Block B)' : 'C.V. Raman Boys Hostel (Block A)';
  const assignedOccupancy = isGirlsWarden ? '16 / 38' : '28 / 38';
  const assignedOccupancyPct = isGirlsWarden ? '42%' : '74%';

  useEffect(() => {
    loadWardenData();
  }, [currentUser]);

  const loadWardenData = async () => {
    try {
      setIsLoading(true);
      const [leavesRes, compRes] = await Promise.all([
        api.getLeaves({ status: 'pending' }),
        api.getComplaints({ status: 'pending' })
      ]);
      setPendingLeaves(leavesRes.leaves.slice(0, 4));
      setActiveComplaints(compRes.complaints.slice(0, 3));
    } catch (err) {
      console.error('Failed to load warden dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await api.approveLeave(leaveId, currentUser?.id || 'u-warden-1', currentUser?.name || 'Prof. Rajesh Sharma');
      setActionMessage('Leave request successfully approved & mess meal count updated.');
      setTimeout(() => setActionMessage(null), 3500);
      loadWardenData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      await api.rejectLeave(leaveId, currentUser?.name || 'Prof. Rajesh Sharma');
      setActionMessage('Leave request rejected.');
      setTimeout(() => setActionMessage(null), 3500);
      loadWardenData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warden Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-2xl p-6 text-white shadow-sm border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest">
              Hostel Warden Operations Portal
            </span>
            <span className="text-xs text-emerald-400 font-medium">Active Duty Roster</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {currentUser?.name || 'Prof. Rajesh Sharma'}
          </h1>
          <p className="text-xs text-emerald-200/80 max-w-2xl flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Assigned Wing: <strong>{assignedHostelName}</strong> • Floors 1 & 2</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('attendance')}
            className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/30 transition-all cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Mark Evening Roll Call</span>
          </button>
          <button
            onClick={onOpenAI}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-700/50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Warden AI</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between animate-in fade-in">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-mono">✕</button>
        </div>
      )}

      {/* 4 WARDEN BENTO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assigned Wing Occupancy */}
        <div
          onClick={() => setActiveTab('rooms')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Wing Bed Occupancy</p>
              <InfoTooltip
                title="Active Wing Residents"
                content="Live count of registered students residing on your assigned hostel block."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{assignedOccupancy}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Beds assigned</p>
            </div>
            <span className="text-emerald-700 text-xs font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
              {assignedOccupancyPct} Active
            </span>
          </div>
        </div>

        {/* Card 2: Pending Outstation Passes */}
        <div
          onClick={() => setActiveTab('leaves')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Pending Leaves</p>
              <InfoTooltip
                title="Warden Sign-Off Required"
                content="Outstation passes pending warden approval. Approved leaves automatically deduct mess food prep."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{pendingLeaves.length}</h2>
              <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Awaiting verification</p>
            </div>
            <span className="text-amber-700 text-xs font-extrabold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
              Urgent
            </span>
          </div>
        </div>

        {/* Card 3: Floor Maintenance SLA */}
        <div
          onClick={() => setActiveTab('complaints')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-rose-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Floor Tickets</p>
              <InfoTooltip
                title="Maintenance Work Orders"
                content="Complaints filed by resident students in your block for water heaters, fans, Wi-Fi, and doors."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{activeComplaints.length}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Plumbing & Electrical</p>
            </div>
            <span className="text-rose-700 text-xs font-extrabold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
              Action Req.
            </span>
          </div>
        </div>

        {/* Card 4: Night Attendance / Roll Call */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Curfew Roster</p>
              <InfoTooltip
                title="9:30 PM Roll Call"
                content="Daily biometric & warden verification of present students vs approved leaves."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">96%</h2>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">2 on verified leave</p>
            </div>
            <span className="text-indigo-700 text-xs font-extrabold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
              On Schedule
            </span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: PENDING LEAVES TABLE & COMPLAINTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Pending Leaves Approval Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Outstation Leave Applications</h3>
                <p className="text-xs text-slate-500">Fast 1-click warden review with parental emergency contact</p>
              </div>
              <button
                onClick={() => setActiveTab('leaves')}
                className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>All Passes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/80 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">All pending leave applications have been reviewed!</p>
                <p className="mt-0.5">No student passes require warden action right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{leave.studentName}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                          Room {leave.roomNumber || 'A-101'}
                        </span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold capitalize">
                          {leave.leaveType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1 italic">"{leave.reason}"</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>{leave.startDate} to {leave.endDate}</span>
                        {leave.parentContact && (
                          <span className="flex items-center gap-1 text-slate-600 font-semibold">
                            <PhoneCall className="w-2.5 h-2.5 text-slate-400" />
                            <span>{leave.parentContact}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleApproveLeave(leave.id)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectLeave(leave.id)}
                        className="px-2 py-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Parental phone consent verified prior to approval</span>
            <button
              onClick={() => setActiveTab('leaves')}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Open Full Gate-Pass Registry →
            </button>
          </div>
        </div>

        {/* Floor Maintenance Triage (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Active Floor Complaints</h3>
                <p className="text-xs text-slate-500">Hostel repair work orders in your block</p>
              </div>
              <button
                onClick={() => setActiveTab('complaints')}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Dispatch Staff
              </button>
            </div>

            <div className="space-y-3">
              {activeComplaints.map((comp) => (
                <div
                  key={comp.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        comp.priority === 'urgent' ? 'bg-rose-600 animate-ping' :
                        comp.priority === 'high' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}></span>
                      <span className="font-bold text-xs text-slate-900 capitalize">{comp.category}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Room {comp.roomNumber || 'A-102'}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium">{comp.title}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{comp.description}</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                    comp.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                    comp.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {comp.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Maintenance SLA: <strong>Active Technicians On-Duty</strong></span>
            <button
              onClick={() => setActiveTab('complaints')}
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Log New Repair Ticket →
            </button>
          </div>
        </div>
      </div>

      {/* WARDEN QUICK TOOLS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Warden Operational Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('attendance')}
            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-center transition-all cursor-pointer group"
          >
            <ClipboardList className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Roll Call Roster</span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-center transition-all cursor-pointer group"
          >
            <CalendarDays className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Gate Passes</span>
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-center transition-all cursor-pointer group"
          >
            <BedDouble className="w-5 h-5 mx-auto text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Room Transfers</span>
          </button>

          <button
            onClick={() => setActiveTab('visitors')}
            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-center transition-all cursor-pointer group"
          >
            <UserCheck className="w-5 h-5 mx-auto text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Visitor Log</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-center transition-all cursor-pointer group"
          >
            <Megaphone className="w-5 h-5 mx-auto text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Hostel Notice</span>
          </button>

          <button
            onClick={() => setActiveTab('food-waste')}
            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-center transition-all cursor-pointer group"
          >
            <Sparkles className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Mess AI Sync</span>
          </button>
        </div>
      </div>
    </div>
  );
};
