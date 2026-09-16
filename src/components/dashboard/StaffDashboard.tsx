import React from 'react';
import {
  Wrench,
  UtensilsCrossed,
  Boxes,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  Calendar,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { DashboardStats } from '../../types/index.ts';

interface StaffDashboardProps {
  stats: DashboardStats | null;
  setActiveTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  stats,
  setActiveTab,
  onOpenAI
}) => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* Staff Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 rounded-2xl p-6 text-white shadow-sm border border-amber-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
              Staff Facility Operations Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">Shift Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Welcome, {currentUser?.name || 'Staff Member'}
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Assigned maintenance work orders, mess kitchen prep logs, and inventory replenishment dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('complaints')}
            className="flex items-center space-x-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30 transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>Work Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('food-waste')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
            <span>Record Food Prep</span>
          </button>
        </div>
      </div>

      {/* Staff KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Maintenance Tickets */}
        <div
          onClick={() => setActiveTab('complaints')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Active Work Orders</p>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.pendingComplaints || 4}
              </h2>
              <p className="text-[11px] text-amber-600 font-bold mt-0.5">High / Medium Priority</p>
            </div>
            <span className="text-xs text-indigo-600 font-bold flex items-center">
              View <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>

        {/* Card 2: Today AI Predicted Meals */}
        <div
          onClick={() => setActiveTab('food-waste')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Today's Headcount Target</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.todayPredictedMeals || 120}
              </h2>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">AI Leave-Adjusted</p>
            </div>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              Cook <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>

        {/* Card 3: Today Food Wastage Recorded */}
        <div
          onClick={() => setActiveTab('food-waste')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-rose-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Logged Kitchen Waste</p>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.todayFoodWasteKg || 12.4} <span className="text-sm font-normal text-slate-500">kg</span>
              </h2>
              <p className="text-[11px] text-rose-600 font-bold mt-0.5">₹{stats?.todayFoodWasteCost?.toLocaleString('en-IN') || '1,840'}</p>
            </div>
            <span className="text-xs text-rose-600 font-bold flex items-center">
              Log <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>

        {/* Card 4: Inventory & Spare Parts */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Stock & Spare Parts</p>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                28
              </h2>
              <p className="text-[11px] text-blue-600 font-bold mt-0.5">3 Items Low Stock</p>
            </div>
            <span className="text-xs text-blue-600 font-bold flex items-center">
              Audit <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Work Bins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bin 1: Priority Work Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assigned Work Orders</h3>
                <p className="text-xs text-slate-500">Urgent electrical, plumbing, and carpentry repairs</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('complaints')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Open Queue &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">Room A-102: Ceiling Fan Regulator</span>
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200 uppercase">High</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">C.V. Raman Boys Block A • Reported by resident</p>
              </div>
              <button
                onClick={() => setActiveTab('complaints')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
              >
                Resolve
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">Mess Hall: Dishwasher Drain Leak</span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200 uppercase">Medium</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Central Dining Facility • Reported by Supervisor</p>
              </div>
              <button
                onClick={() => setActiveTab('complaints')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>

        {/* Bin 2: Dining & Mess Tasks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mess & Food Wastage Tasks</h3>
                <p className="text-xs text-slate-500">Daily meal attendance and post-meal waste auditing</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('food-waste')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Food Waste AI &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">Log Lunch Preparation & Weights</span>
                <p className="text-xs text-slate-500 mt-0.5">Record consumed vs left-over amounts for AI model</p>
              </div>
              <button
                onClick={() => setActiveTab('food-waste')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Log Meal Prep
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">Check Stock of Grains & Dairy</span>
                <p className="text-xs text-slate-500 mt-0.5">Verify dry pantry storage levels before evening shift</p>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Inventory
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
