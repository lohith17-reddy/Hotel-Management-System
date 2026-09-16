import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
  MapPin,
  BedDouble
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { Hostel, Block } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface HostelsViewProps {
  onSelectHostelForRooms: (hostelId: string) => void;
}

export const HostelsView: React.FC<HostelsViewProps> = ({ onSelectHostelForRooms }) => {
  const { currentUser } = useAuth();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [newHostelForm, setNewHostelForm] = useState({
    name: '',
    hostelCode: '',
    gender: 'male' as 'male' | 'female' | 'coed',
    address: '',
    numberOfBlocks: 2,
    wardenName: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [hRes, bRes] = await Promise.all([api.getHostels(), api.getBlocks()]);
      if (hRes.success) setHostels(hRes.hostels);
      if (bRes.success) setBlocks(bRes.blocks);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createHostel(newHostelForm);
      if (res.success) {
        setShowAddModal(false);
        setNewHostelForm({
          name: '',
          hostelCode: '',
          gender: 'male',
          address: '',
          numberOfBlocks: 2,
          wardenName: '',
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error creating hostel');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Buildings & Blocks</h1>
          <p className="text-xs text-slate-500">Manage residential wings, warden assignments, and building capacity</p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hostel Building</span>
          </button>
        )}
      </div>

      {/* Hostels List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hostels.map(h => {
          const hostelBlocks = blocks.filter(b => b.hostelId === h.id);
          const occupancyRate = h.capacity > 0 ? ((h.occupancy / h.capacity) * 100).toFixed(1) : '0';

          return (
            <div key={h.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-indigo-300 transition-colors">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2.5 rounded-xl text-white ${h.gender === 'female' ? 'bg-rose-500' : 'bg-indigo-600'}`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-base font-bold text-slate-900">{h.name}</h2>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          h.gender === 'female' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {h.gender} Residents
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                        <span className="font-semibold text-slate-700 mr-1.5">{h.hostelCode}</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3 mx-1 text-slate-400" />
                        <span className="truncate max-w-xs">{h.address}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Occupancy Status</span>
                    <span className="font-bold text-indigo-900">
                      {h.occupancy} / {h.capacity} beds occupied ({occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${occupancyRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Warden & Blocks Information */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-400 block font-medium">Hostel Warden</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{h.wardenName || 'Assigned Staff'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-400 block font-medium">Residential Wings</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{hostelBlocks.length} Active Blocks</span>
                  </div>
                </div>

                {/* Sub-Blocks Pill List */}
                <div className="mt-3">
                  <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">Registered Blocks:</span>
                  <div className="flex flex-wrap gap-2">
                    {hostelBlocks.map(b => (
                      <span key={b.id} className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                        {b.name} ({b.floors} Floors)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* View Rooms Grid Button */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onSelectHostelForRooms(h.id)}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <BedDouble className="w-4 h-4" />
                  <span>Explore Rooms & Bed Allocation Grid</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD HOSTEL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Hostel Building</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateHostel} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Homi Bhabha Boys Hostel"
                  value={newHostelForm.name}
                  onChange={e => setNewHostelForm({ ...newHostelForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HBH-BH3"
                    value={newHostelForm.hostelCode}
                    onChange={e => setNewHostelForm({ ...newHostelForm, hostelCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender Restriction</label>
                  <select
                    value={newHostelForm.gender}
                    onChange={e => setNewHostelForm({ ...newHostelForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="male">Male (Boys)</option>
                    <option value="female">Female (Girls)</option>
                    <option value="coed">Co-ed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. West Campus, Near Sports Complex"
                  value={newHostelForm.address}
                  onChange={e => setNewHostelForm({ ...newHostelForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Warden Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ramesh Gupta"
                  value={newHostelForm.wardenName}
                  onChange={e => setNewHostelForm({ ...newHostelForm, wardenName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
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
                  Create Hostel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
