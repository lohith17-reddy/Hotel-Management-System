import React from 'react';
import {
  Building2,
  BedDouble,
  CreditCard,
  Wrench,
  UtensilsCrossed,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { DashboardStats } from '../../types/index.ts';
import { InfoTooltip } from '../common/InfoTooltip.tsx';

interface AdminDashboardProps {
  stats: DashboardStats | null;
  aiInsights: string[];
  isAiLoading: boolean;
  onRefreshAI: () => void;
  setActiveTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  aiInsights,
  isAiLoading,
  onRefreshAI,
  setActiveTab,
  onOpenAI
}) => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">
              Central Administration Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">HostelCore OS v2.4</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Welcome, Administrator {currentUser?.name || 'Lohith Sagar Reddy'}
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Campus-wide governance overview: 2 residential blocks, 1 scholars wing, mess forecasting algorithms, and centralized fiscal ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAI}
            className="flex items-center space-x-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>AI Executive Query</span>
          </button>
          <button
            onClick={() => setActiveTab('audit-logs')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY BENTO METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Campus Occupancy */}
        <div
          onClick={() => setActiveTab('rooms')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Total Campus Occupancy</p>
              <InfoTooltip
                title="Licensed Bed Capacity"
                content="Real-time occupied beds across all blocks. Trigger automated waitlist clearing when vacant beds open."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.occupiedBeds || 44}
                <span className="text-xs text-slate-400 font-normal ml-1">/{stats?.totalBeds || 76}</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{stats?.availableBeds || 32} beds currently vacant</p>
            </div>
            <span className="text-emerald-700 text-xs font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
              {stats?.occupancyPercentage || 58.7}%
            </span>
          </div>
        </div>

        {/* Card 2: Financial Ledger & Receivables */}
        <div
          onClick={() => setActiveTab('fees')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Semester Fee Dues</p>
              <InfoTooltip
                title="Fiscal Receivables"
                content="Sum of unpaid hostel rent, mess meal subscriptions, and utility deposits pending collection."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">₹42.5k</h2>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">₹1.82L collected (81%)</p>
            </div>
            <span className="text-rose-700 text-xs font-extrabold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
              3 Pending
            </span>
          </div>
        </div>

        {/* Card 3: AI Food Wastage Index */}
        <div
          onClick={() => setActiveTab('food-waste')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Mess AI Efficiency</p>
              <InfoTooltip
                title="Food Waste Reduction Index"
                content="Section 37 kitchen waste monitoring. Live reduction rate compared against legacy un-metered cooking."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{stats?.todayPredictedMeals || 120}</h2>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">~{stats?.averageWastePercentage || 6.8}% waste limit</p>
            </div>
            <span className="text-emerald-700 text-xs font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Optimized</span>
            </span>
          </div>
        </div>

        {/* Card 4: Maintenance SLA & Incidents */}
        <div
          onClick={() => setActiveTab('complaints')}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Maintenance Tickets</p>
              <InfoTooltip
                title="Campus Triage SLA"
                content="Active maintenance requests across plumbing, electrical, carpentry, and Wi-Fi networks."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{stats?.pendingComplaints || 3}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Avg resolution time: 4.2h</p>
            </div>
            <span className="text-amber-700 text-xs font-extrabold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
              Triage Open
            </span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: BLOCK DISTRIBUTION & AI WARDEN ADVISORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Block Allocations Matrix (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Campus Block Occupancy Breakdown</h3>
                <p className="text-xs text-slate-500">Live bed distribution across male, female, and postgraduate halls</p>
              </div>
              <button
                onClick={() => setActiveTab('hostels')}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Manage Blocks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span className="text-slate-800">CV Raman Boys Hostel (Block A)</span>
                    <span className="text-[10px] text-slate-500 font-normal">• Warden: Prof. Rajesh Sharma</span>
                  </div>
                  <span className="text-slate-900 font-mono">28 / 38 Beds (73.7%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-[74%] rounded-full transition-all"></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-slate-800">Sarojini Naidu Girls Hostel (Block B)</span>
                    <span className="text-[10px] text-slate-500 font-normal">• Warden: Dr. Sunita Deshmukh</span>
                  </div>
                  <span className="text-slate-900 font-mono">16 / 38 Beds (42.1%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[42%] rounded-full transition-all"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>System State: <strong>All Infrastructure Nodes Synchronized</strong></span>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('allocations')}
                className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                + New Bed Allocation
              </button>
            </div>
          </div>
        </div>

        {/* AI Executive Warden Advisor (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-500/30 text-indigo-300 rounded-lg">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">AI Chief Advisor</h3>
              </div>
              <button
                onClick={onRefreshAI}
                disabled={isAiLoading}
                className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {isAiLoading ? 'Analyzing...' : 'Refresh AI'}
              </button>
            </div>

            <div className="space-y-3">
              {aiInsights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-200 flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-600/50 text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed text-[11px]">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>Powered by Gemini 2.5 Flash</span>
            <button
              onClick={onOpenAI}
              className="text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              Open Query Terminal →
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ADMIN PATHWAYS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Administration Management Fast Pathways</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('hostels')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer group"
          >
            <Building2 className="w-5 h-5 mx-auto text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Manage Hostels</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer group"
          >
            <Users className="w-5 h-5 mx-auto text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Student Registry</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer group"
          >
            <CreditCard className="w-5 h-5 mx-auto text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Fee Invoicing</span>
          </button>

          <button
            onClick={() => setActiveTab('food-waste')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer group"
          >
            <UtensilsCrossed className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Food Waste AI</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer group"
          >
            <FileSpreadsheet className="w-5 h-5 mx-auto text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Hostel Assets</span>
          </button>

          <button
            onClick={() => setActiveTab('audit-logs')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-center transition-all cursor-pointer group"
          >
            <ShieldCheck className="w-5 h-5 mx-auto text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 block mt-2">Security Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
