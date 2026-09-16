import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Lock,
  Clock,
  UserCheck,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { AuditLog } from '../../types/index.ts';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchData = async () => {
    try {
      const res = await api.getAuditLogs();
      if (res.success) {
        setLogs(res.auditLogs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLogs = logs.filter(l => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Security & Operational Audit Logs</h1>
          <p className="text-xs text-slate-500">Immutable trace of allocations, approvals, logins & system modifications</p>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Tamper-Resistant Security Active</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail by user, action or entity..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor / User</th>
                <th className="px-4 py-3">Action Performed</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-sans">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 font-sans">
                    <div>{l.userName}</div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{l.userRole}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-indigo-700">{l.action}</td>
                  <td className="px-4 py-3 text-slate-700 capitalize font-sans">{l.entity}</td>
                  <td className="px-4 py-3 text-slate-500">{l.ipAddress || '127.0.0.1'}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate font-sans text-xs">
                    {l.details ? JSON.stringify(l.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
