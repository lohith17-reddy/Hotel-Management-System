import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  BedDouble,
  CreditCard,
  CalendarDays,
  Wrench,
  UserCheck,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { Student } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export const StudentsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'info' | 'allocation' | 'fees' | 'leaves' | 'complaints'>('info');

  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    registrationNumber: '',
    rollNumber: '',
    department: 'Computer Science & Engineering',
    year: 2,
    gender: 'male' as 'male' | 'female',
    guardianName: '',
    guardianPhone: '',
    address: '',
    bloodGroup: 'O+',
  });

  const fetchData = async () => {
    try {
      const res = await api.getStudents();
      if (res.success) {
        setStudents(res.students);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = students.filter(st => {
    if (departmentFilter !== 'all' && st.department !== departmentFilter) return false;
    if (yearFilter !== 'all' && st.year !== Number(yearFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = st.user?.name.toLowerCase().includes(q);
      const matchReg = st.registrationNumber.toLowerCase().includes(q);
      const matchRoll = st.rollNumber.toLowerCase().includes(q);
      if (!matchName && !matchReg && !matchRoll) return false;
    }
    return true;
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createStudent(newStudentForm);
      if (res.success) {
        setShowAddModal(false);
        setNewStudentForm({
          name: '',
          email: '',
          phone: '',
          registrationNumber: '',
          rollNumber: '',
          department: 'Computer Science & Engineering',
          year: 2,
          gender: 'male',
          guardianName: '',
          guardianPhone: '',
          address: '',
          bloodGroup: 'O+',
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error registering student');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Register Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Resident Directory</h1>
          <p className="text-xs text-slate-500">Comprehensive records of all registered hostel residents, guardians & rooms</p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Student</span>
          </button>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, registration no, or roll no..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Department:</span>
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Electronics & Communication">ECE</option>
            <option value="Mechanical Engineering">Mechanical</option>
            <option value="Civil Engineering">Civil</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Year:</span>
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800"
          >
            <option value="all">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Reg Number</th>
                <th className="px-4 py-3">Dept & Year</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Assigned Bed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(st => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] border border-slate-200">
                      {st.user?.name.charAt(0) || 'S'}
                    </div>
                    <span>{st.user?.name}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-indigo-700">{st.registrationNumber}</td>
                  <td className="px-4 py-3">
                    <div>{st.department}</div>
                    <span className="text-[10px] text-slate-400">Year {st.year} • {st.gender}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{st.user?.email}</div>
                    <span className="text-[10px] text-slate-400">{st.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    {st.currentAllocation ? (
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {st.currentAllocation.roomNumber} ({st.currentAllocation.bedNumber})
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {st.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedStudent(st);
                        setActiveProfileTab('info');
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-semibold transition-colors flex items-center space-x-1 ml-auto cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View 360° Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: 360° STUDENT PROFILE DETAIL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                  {selectedStudent.user?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedStudent.user?.name}</h3>
                  <p className="text-xs text-slate-500">{selectedStudent.registrationNumber} • {selectedStudent.department}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {/* Profile Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 py-3">
              {(['info', 'allocation', 'fees', 'leaves', 'complaints'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveProfileTab(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors cursor-pointer ${
                    activeProfileTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {activeProfileTab === 'info' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.user?.email}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Phone Number</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.phone}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Guardian Name</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.guardianName || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Guardian Phone</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.guardianPhone || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Blood Group</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.bloodGroup || 'O+'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Admission Date</span>
                    <span className="font-semibold text-slate-800">{new Date(selectedStudent.admissionDate).toLocaleDateString()}</span>
                  </div>
                  <div className="col-span-2 bg-slate-50 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Permanent Address</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.address || 'N/A'}</span>
                  </div>
                </div>
              )}

              {activeProfileTab === 'allocation' && (
                <div>
                  {selectedStudent.currentAllocation ? (
                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-xs space-y-2">
                      <div className="font-bold text-indigo-950 text-sm">
                        Room {selectedStudent.currentAllocation.roomNumber} ({selectedStudent.currentAllocation.bedNumber})
                      </div>
                      <div><strong>Hostel:</strong> {selectedStudent.currentAllocation.hostelName}</div>
                      <div><strong>Wing/Block:</strong> {selectedStudent.currentAllocation.blockName}</div>
                      <div><strong>Allocated By:</strong> {selectedStudent.currentAllocation.allocatedBy}</div>
                      <div><strong>Since:</strong> {new Date(selectedStudent.currentAllocation.allocationDate).toLocaleDateString()}</div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">No active room allocated for this student.</p>
                  )}
                </div>
              )}

              {activeProfileTab === 'fees' && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-900">Hostel Rent & Maintenance — Sem 1</div>
                      <span className="text-[10px] text-slate-400">Due: 2025-08-30</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Paid (₹38,000)
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-900">Mess Charges — Month of August</div>
                      <span className="text-[10px] text-slate-400">Due: 2025-09-05</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Pending (₹4,500)
                    </span>
                  </div>
                </div>
              )}

              {activeProfileTab === 'leaves' && (
                <div className="text-xs text-slate-500 text-center py-4">
                  Approved leaves automatically synchronize with mess attendance forecasting.
                </div>
              )}

              {activeProfileTab === 'complaints' && (
                <div className="text-xs text-slate-500 text-center py-4">
                  Complaints logged by this resident are tracked in the Maintenance Ticketing module.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW STUDENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Register New Student Resident</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newStudentForm.name}
                    onChange={e => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newStudentForm.email}
                    onChange={e => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024BCSE088"
                    value={newStudentForm.registrationNumber}
                    onChange={e => setNewStudentForm({ ...newStudentForm, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. CS-24-88"
                    value={newStudentForm.rollNumber}
                    onChange={e => setNewStudentForm({ ...newStudentForm, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newStudentForm.department}
                    onChange={e => setNewStudentForm({ ...newStudentForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={newStudentForm.year}
                    onChange={e => setNewStudentForm({ ...newStudentForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newStudentForm.phone}
                    onChange={e => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newStudentForm.gender}
                    onChange={e => setNewStudentForm({ ...newStudentForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={newStudentForm.guardianName}
                    onChange={e => setNewStudentForm({ ...newStudentForm, guardianName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Phone</label>
                  <input
                    type="tel"
                    value={newStudentForm.guardianPhone}
                    onChange={e => setNewStudentForm({ ...newStudentForm, guardianPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
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
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
