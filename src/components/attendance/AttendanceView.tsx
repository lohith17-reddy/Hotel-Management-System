import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  Search,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { Attendance, Student } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export const AttendanceView: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchData = async () => {
    try {
      const [attRes, stRes] = await Promise.all([
        api.getAttendance(selectedDate),
        api.getStudents(),
      ]);
      if (attRes.success) setAttendanceRecords(attRes.attendance);
      if (stRes.success) setStudents(stRes.students);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleToggleAttendance = async (student: Student, currentStatus?: 'present' | 'absent' | 'on_leave') => {
    const nextStatus = currentStatus === 'present' ? 'absent' : 'present';
    try {
      await api.saveAttendance([
        {
          studentId: student.id,
          studentName: student.user?.name || 'Student',
          hostelId: student.currentAllocation?.hostelId || 'h-cvr-1',
          roomNumber: student.currentAllocation?.roomNumber || 'A-101',
          date: selectedDate,
          status: nextStatus,
          markedBy: currentUser?.name || 'Warden',
        },
      ]);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error recording attendance');
    }
  };

  const handleMarkAll = async (status: 'present' | 'absent') => {
    try {
      const records = students.map(st => ({
        studentId: st.id,
        studentName: st.user?.name || 'Student',
        hostelId: st.currentAllocation?.hostelId || 'h-cvr-1',
        roomNumber: st.currentAllocation?.roomNumber || 'A-101',
        date: selectedDate,
        status: status as 'present' | 'absent',
        markedBy: currentUser?.name || 'Warden',
      }));
      await api.saveAttendance(records);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredStudents = students.filter(st => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      st.user?.name.toLowerCase().includes(q) ||
      st.registrationNumber.toLowerCase().includes(q)
    );
  });

  const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
  const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daily Night Curfew & Roll Call Attendance</h1>
          <p className="text-xs text-slate-500">Record and verify daily resident physical presence for safety & accountability</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs text-slate-800 focus:outline-none"
            />
          </div>
          <button
            onClick={() => handleMarkAll('present')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Mark All Present
          </button>
        </div>
      </div>

      {/* STATS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Total Enrolled Residents</span>
            <span className="text-2xl font-black text-slate-900">{students.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-700 font-semibold block">Present & Accounted</span>
            <span className="text-2xl font-black text-emerald-700">{presentCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-700 font-semibold block">Absent / Unmarked</span>
            <span className="text-2xl font-black text-rose-700">{absentCount || Math.max(0, students.length - presentCount)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter residents by name or registration number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Resident Name</th>
                <th className="px-4 py-3">Reg Number</th>
                <th className="px-4 py-3">Room & Bed</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Attendance Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(st => {
                const rec = attendanceRecords.find(a => a.studentId === st.id);
                const isPresent = rec?.status === 'present';
                const isAbsent = rec?.status === 'absent';
                const isLeave = rec?.status === 'leave';

                return (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{st.user?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{st.registrationNumber}</td>
                    <td className="px-4 py-3 font-medium text-indigo-900">
                      {st.currentAllocation ? `${st.currentAllocation.roomNumber} (${st.currentAllocation.bedNumber})` : 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{st.department}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        isPresent ? 'bg-emerald-100 text-emerald-800' :
                        isAbsent ? 'bg-rose-100 text-rose-800' :
                        isLeave ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {rec?.status || 'Unmarked'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleToggleAttendance(st, isPresent ? 'present' : 'absent')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isPresent ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700'
                          }`}
                          title="Mark Present"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleAttendance(st, isAbsent ? 'absent' : 'present')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isAbsent ? 'bg-rose-600 text-white' : 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700'
                          }`}
                          title="Mark Absent"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
