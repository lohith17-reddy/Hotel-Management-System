import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  CreditCard,
  UtensilsCrossed,
  CalendarDays,
  Wrench,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  Building2,
  Receipt,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/apiClient.ts';
import { Complaint, LeaveRequest, MealAttendance, DashboardStats } from '../../types/index.ts';
import { InfoTooltip } from '../common/InfoTooltip.tsx';

interface StudentDashboardProps {
  stats: DashboardStats | null;
  setActiveTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  stats,
  setActiveTab,
  onOpenAI
}) => {
  const { currentUser, currentStudent, currentAllocation } = useAuth();
  const [studentComplaints, setStudentComplaints] = useState<Complaint[]>([]);
  const [studentLeaves, setStudentLeaves] = useState<LeaveRequest[]>([]);
  const [mealAttendance, setMealAttendance] = useState<MealAttendance[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadStudentDashboardData();
  }, [currentUser, currentStudent]);

  const loadStudentDashboardData = async () => {
    try {
      const [compRes, leavesRes, mealsRes] = await Promise.all([
        api.getComplaints(),
        api.getLeaves(),
        api.getMealAttendance({ date: todayStr })
      ]);

      const myId = currentStudent?.id || currentUser?.id;
      const myComps = compRes.complaints.filter(c => c.studentId === myId || c.studentName === currentUser?.name);
      const myLeaves = leavesRes.leaves.filter(l => l.studentId === myId || l.studentName === currentUser?.name);
      const myMeals = mealsRes.mealAttendance.filter(m => m.studentId === myId || m.studentName === currentUser?.name);

      setStudentComplaints(myComps.slice(0, 3));
      setStudentLeaves(myLeaves.slice(0, 2));
      setMealAttendance(myMeals);
    } catch (err) {
      console.error('Failed to load student dashboard data', err);
    }
  };

  const handleToggleMeal = async (mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner', currentStatus?: string) => {
    const nextStatus = currentStatus === 'eating' ? 'not_eating' : 'eating';
    try {
      const myId = currentStudent?.id || currentUser?.id || 's-1';
      await api.setMealOptIn({
        studentId: myId,
        studentName: currentUser?.name || 'Resident Student',
        mealType,
        date: todayStr,
        status: nextStatus as any
      });
      setActionNotice(`Updated today's ${mealType.toUpperCase()} status to: ${nextStatus === 'eating' ? 'Eating in Mess 🍽️' : 'Skipping / Out ❌'}`);
      setTimeout(() => setActionNotice(null), 3500);
      loadStudentDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const getMealStatus = (type: 'breakfast' | 'lunch' | 'snacks' | 'dinner') => {
    const record = mealAttendance.find(m => m.mealType === type);
    return record?.status || 'eating';
  };

  return (
    <div className="space-y-6">
      {/* Student Resident Identity Card Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm border border-indigo-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase tracking-widest">
                Resident Student Portal
              </span>
              <span className="text-xs text-indigo-300 font-mono">Reg: {currentStudent?.registrationNumber || '2023CS0142'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {currentUser?.name || 'Rohan Verma'}
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {currentAllocation?.hostelName || 'C.V. Raman Boys Hostel'} • <strong>Room {currentAllocation?.roomNumber || 'A-101'}</strong> ({currentAllocation?.bedNumber || 'Bed 1'})
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('my-room')}
            className="flex items-center space-x-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <BedDouble className="w-4 h-4" />
            <span>My Room Details</span>
          </button>
          <button
            onClick={onOpenAI}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between animate-in fade-in">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-900 font-mono">✕</button>
        </div>
      )}

      {/* 4 STUDENT BENTO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Allocated Room */}
        <div
          onClick={() => setActiveTab('my-room')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Assigned Space</p>
              <InfoTooltip
                title="Room & Bed Allocation"
                content="Your authorized residential space and key assignment for Academic Year 2024-25."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Room {currentAllocation?.roomNumber || 'A-101'}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{currentAllocation?.bedNumber || 'Bed 1'} • Double AC</p>
            </div>
            <span className="text-emerald-700 text-xs font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
              Active
            </span>
          </div>
        </div>

        {/* Card 2: Fee Balance Status */}
        <div
          onClick={() => setActiveTab('fees')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Hostel & Mess Dues</p>
              <InfoTooltip
                title="Semester Fee Clearance"
                content="Verified payment receipt and zero balance clearance for room rent and food subscription."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">₹0 Due</h2>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">All semester invoices paid</p>
            </div>
            <span className="text-blue-700 text-xs font-extrabold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
              Receipt Ready
            </span>
          </div>
        </div>

        {/* Card 3: Today's Mess Meals Status */}
        <div
          onClick={() => setActiveTab('food-waste')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Daily Meal Opt-In</p>
              <InfoTooltip
                title="Mess Food Waste Prevention"
                content="Notify the chef when you are eating in or skipping meals so portions are cooked accurately."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">4 / 4 Meals</h2>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Dining in today</p>
            </div>
            <span className="text-emerald-700 text-xs font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
              Opted In
            </span>
          </div>
        </div>

        {/* Card 4: Outstation Gate Passes */}
        <div
          onClick={() => setActiveTab('leaves')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Gate Pass & Leave</p>
              <InfoTooltip
                title="Outstation Travel Authorizations"
                content="Submit weekend passes or home leaves. Approved passes are sent directly to the security gate."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {studentLeaves.length > 0 ? studentLeaves[0].status.toUpperCase() : 'No Pass'}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {studentLeaves.length > 0 ? `Until ${studentLeaves[0].endDate}` : 'Campus resident'}
              </p>
            </div>
            <span className="text-amber-700 text-xs font-extrabold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
              Apply
            </span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE MESS MEAL SELECTION CARD & COMPLAINT TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Interactive Today's Meal Opt-In / Opt-Out Widget (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Today's Mess Meals • Smart Opt-In</h3>
                <p className="text-xs text-slate-500">Toggle whether you'll eat to prevent excess cooking and cut campus food waste</p>
              </div>
              <button
                onClick={() => setActiveTab('food-waste')}
                className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Full Menu & AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Breakfast */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Breakfast (7:30 - 9:30 AM)</span>
                  <span className="text-[11px] text-slate-500 block">Idli Sambar, Chutney & Tea</span>
                </div>
                <button
                  onClick={() => handleToggleMeal('breakfast', getMealStatus('breakfast'))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    getMealStatus('breakfast') === 'eating'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {getMealStatus('breakfast') === 'eating' ? '✓ Eating' : '✕ Skipping'}
                </button>
              </div>

              {/* Lunch */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Lunch (12:30 - 2:30 PM)</span>
                  <span className="text-[11px] text-slate-500 block">Paneer Masala, Rice & Dal</span>
                </div>
                <button
                  onClick={() => handleToggleMeal('lunch', getMealStatus('lunch'))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    getMealStatus('lunch') === 'eating'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {getMealStatus('lunch') === 'eating' ? '✓ Eating' : '✕ Skipping'}
                </button>
              </div>

              {/* Snacks */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Snacks (5:00 - 6:00 PM)</span>
                  <span className="text-[11px] text-slate-500 block">Veg Cutlet & Filter Coffee</span>
                </div>
                <button
                  onClick={() => handleToggleMeal('snacks', getMealStatus('snacks'))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    getMealStatus('snacks') === 'eating'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {getMealStatus('snacks') === 'eating' ? '✓ Eating' : '✕ Skipping'}
                </button>
              </div>

              {/* Dinner */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Dinner (7:30 - 9:30 PM)</span>
                  <span className="text-[11px] text-slate-500 block">Jeera Rice, Chana & Salad</span>
                </div>
                <button
                  onClick={() => handleToggleMeal('dinner', getMealStatus('dinner'))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    getMealStatus('dinner') === 'eating'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {getMealStatus('dinner') === 'eating' ? '✓ Eating' : '✕ Skipping'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Mess Sync: <strong>Kitchen preparation auto-adjusts every 30 mins</strong></span>
            <span className="text-emerald-600 font-semibold text-[11px]">🌱 Helping save ~120kg weekly</span>
          </div>
        </div>

        {/* My Maintenance Tickets & Roommate Info (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">My Service & Repair Tickets</h3>
                <p className="text-xs text-slate-500">Track status of maintenance requests you filed</p>
              </div>
              <button
                onClick={() => setActiveTab('complaints')}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                + New Ticket
              </button>
            </div>

            {studentComplaints.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200/80 text-slate-500 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <p className="font-bold text-slate-700">No active maintenance issues in your room!</p>
                <p className="mt-0.5">Everything is operating normally.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentComplaints.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{comp.title}</span>
                        <span className="text-[10px] text-slate-500 capitalize">({comp.category})</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1">{comp.description}</p>
                      <div className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1 pt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Status: {comp.status.toUpperCase()} {comp.assignedTo && `• Assigned to ${comp.assignedTo}`}</span>
                      </div>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      comp.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      comp.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {comp.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Emergency Hostel Helpdesk: <strong>Ext. 1044</strong></span>
            <button
              onClick={() => setActiveTab('complaints')}
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Report New Issue →
            </button>
          </div>
        </div>
      </div>

      {/* STUDENT SELF-SERVICE QUICK PATHWAYS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Resident Student Fast Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('my-room')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer group"
          >
            <BedDouble className="w-5 h-5 mx-auto text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">My Room & Key</span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer group"
          >
            <CalendarDays className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Apply Leave Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer group"
          >
            <Building2 className="w-5 h-5 mx-auto text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Request Transfer</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer group"
          >
            <Wrench className="w-5 h-5 mx-auto text-rose-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Lodge Repair</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer group"
          >
            <Receipt className="w-5 h-5 mx-auto text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Fee Receipts</span>
          </button>

          <button
            onClick={onOpenAI}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer group"
          >
            <Sparkles className="w-5 h-5 mx-auto text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Resident AI Bot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
