import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Building2,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Search,
  Filter,
  UserPlus,
  DoorOpen
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { Hostel, Block, Room, Bed, Student } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface RoomsBedsViewProps {
  initialHostelId?: string;
  onOpenAllocateModal?: (bedId: string, roomId: string, hostelId: string, blockId: string) => void;
}

export const RoomsBedsView: React.FC<RoomsBedsViewProps> = ({ initialHostelId, onOpenAllocateModal }) => {
  const { currentUser } = useAuth();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [rooms, setRooms] = useState<(Room & { beds?: Bed[] })[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Filter selections
  const [selectedHostel, setSelectedHostel] = useState<string>(initialHostelId || 'all');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showAddRoomModal, setShowAddRoomModal] = useState<boolean>(false);
  const [showAllocateDirectModal, setShowAllocateDirectModal] = useState<boolean>(false);
  const [targetBedForAllocation, setTargetBedForAllocation] = useState<Bed | null>(null);
  const [selectedStudentForBed, setSelectedStudentForBed] = useState<string>('');

  const [newRoomForm, setNewRoomForm] = useState({
    hostelId: '',
    blockId: '',
    roomNumber: '',
    floor: 1,
    roomType: 'double',
    capacity: 2,
  });

  const fetchData = async () => {
    try {
      const [hRes, bRes, rRes, sRes] = await Promise.all([
        api.getHostels(),
        api.getBlocks(),
        api.getRooms(),
        api.getStudents()
      ]);
      if (hRes.success) {
        setHostels(hRes.hostels);
        if (!initialHostelId && hRes.hostels.length > 0 && selectedHostel === 'all') {
          setSelectedHostel(hRes.hostels[0].id);
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

  useEffect(() => {
    if (initialHostelId) {
      setSelectedHostel(initialHostelId);
    }
  }, [initialHostelId]);

  // Filtered rooms
  const filteredRooms = rooms.filter(r => {
    if (selectedHostel !== 'all' && r.hostelId !== selectedHostel) return false;
    if (selectedBlock !== 'all' && r.blockId !== selectedBlock) return false;
    if (selectedFloor !== 'all' && r.floor !== Number(selectedFloor)) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery && !r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createRoom(newRoomForm);
      if (res.success) {
        setShowAddRoomModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error adding room');
    }
  };

  const handleDirectBedAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBedForAllocation || !selectedStudentForBed) return;
    try {
      const res = await api.allocateStudent({
        studentId: selectedStudentForBed,
        hostelId: targetBedForAllocation.hostelId,
        blockId: targetBedForAllocation.blockId,
        roomId: targetBedForAllocation.roomId,
        bedId: targetBedForAllocation.id,
        allocatedBy: currentUser?.name || 'Administrator',
      });
      if (res.success) {
        setShowAllocateDirectModal(false);
        setTargetBedForAllocation(null);
        setSelectedStudentForBed('');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error allocating bed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Interactive Room & Bed Grid</h1>
          <p className="text-xs text-slate-500">Visual floor plan, room capacity, bed occupants & quick allocation</p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => {
              if (hostels.length > 0) {
                const hId = selectedHostel !== 'all' ? selectedHostel : hostels[0].id;
                const hBlocks = blocks.filter(b => b.hostelId === hId);
                setNewRoomForm({
                  hostelId: hId,
                  blockId: hBlocks[0]?.id || '',
                  roomNumber: '',
                  floor: 1,
                  roomType: 'double',
                  capacity: 2,
                });
              }
              setShowAddRoomModal(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Room</span>
          </button>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Hostel Selector */}
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <select
            value={selectedHostel}
            onChange={e => {
              setSelectedHostel(e.target.value);
              setSelectedBlock('all');
            }}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 focus:outline-indigo-600"
          >
            <option value="all">All Hostels</option>
            {hostels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        {/* Block Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Block:</span>
          <select
            value={selectedBlock}
            onChange={e => setSelectedBlock(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800"
          >
            <option value="all">All Blocks</option>
            {blocks
              .filter(b => selectedHostel === 'all' || b.hostelId === selectedHostel)
              .map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
          </select>
        </div>

        {/* Floor Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Floor:</span>
          <select
            value={selectedFloor}
            onChange={e => setSelectedFloor(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800"
          >
            <option value="all">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
          </select>
        </div>

        {/* Availability Status */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800"
          >
            <option value="all">All Statuses</option>
            <option value="available">Has Vacant Beds</option>
            <option value="occupied">Fully Occupied</option>
          </select>
        </div>

        {/* Search Room */}
        <div className="flex-1 min-w-[150px] relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search room number (e.g. A-101)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* ROOMS GRID */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No rooms match the selected filters</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the hostel, block, or floor criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map(room => {
            const hostel = hostels.find(h => h.id === room.hostelId);
            const block = blocks.find(b => b.id === room.blockId);
            const isFull = room.occupiedBeds >= room.capacity;

            return (
              <div
                key={room.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                  isFull ? 'border-slate-200' : 'border-indigo-200 hover:shadow-md'
                }`}
              >
                {/* Room Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl text-white font-black text-xs ${isFull ? 'bg-slate-700' : 'bg-indigo-600'}`}>
                      {room.roomNumber}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{room.roomNumber}</h3>
                      <p className="text-[11px] text-slate-500">
                        {block?.name || 'Block'} • Floor {room.floor}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    isFull ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}>
                    {isFull ? 'Full' : `${room.capacity - room.occupiedBeds} Vacant`}
                  </span>
                </div>

                {/* Beds Slot List */}
                <div className="mt-4 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Beds ({room.occupiedBeds}/{room.capacity} occupied)
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    {room.beds?.map(bed => {
                      const isOccupied = bed.status === 'occupied';

                      return (
                        <div
                          key={bed.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                            isOccupied
                              ? 'bg-slate-50 border-slate-200 text-slate-800'
                              : 'bg-emerald-50/40 border-emerald-200 text-emerald-900 hover:bg-emerald-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <BedDouble className={`w-4 h-4 flex-shrink-0 ${isOccupied ? 'text-indigo-600' : 'text-emerald-600'}`} />
                            <div className="min-w-0">
                              <span className="text-xs font-bold block leading-tight">{bed.bedNumber}</span>
                              {isOccupied ? (
                                <span className="text-[11px] text-slate-600 truncate block">
                                  {bed.currentStudentName || 'Occupied Student'}
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-semibold">Vacant & Ready</span>
                              )}
                            </div>
                          </div>

                          {!isOccupied && (currentUser?.role === 'admin' || currentUser?.role === 'warden') && (
                            <button
                              onClick={() => {
                                setTargetBedForAllocation(bed);
                                setShowAllocateDirectModal(true);
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex-shrink-0 flex items-center space-x-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Allocate</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: DIRECT ALLOCATE BED */}
      {showAllocateDirectModal && targetBedForAllocation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Allocate Student to Bed</h3>
              </div>
              <button onClick={() => setShowAllocateDirectModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="mt-3 bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <div><strong>Target Bed:</strong> {targetBedForAllocation.bedNumber}</div>
              <div><strong>Hostel ID:</strong> {targetBedForAllocation.hostelId}</div>
            </div>

            <form onSubmit={handleDirectBedAllocate} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
                <select
                  value={selectedStudentForBed}
                  onChange={e => setSelectedStudentForBed(e.target.value)}
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

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAllocateDirectModal(false)}
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

      {/* MODAL: ADD NEW ROOM */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Room</h3>
              <button onClick={() => setShowAddRoomModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateRoom} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel</label>
                <select
                  value={newRoomForm.hostelId}
                  onChange={e => {
                    const hId = e.target.value;
                    const hBlocks = blocks.filter(b => b.hostelId === hId);
                    setNewRoomForm({ ...newRoomForm, hostelId: hId, blockId: hBlocks[0]?.id || '' });
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
                  value={newRoomForm.blockId}
                  onChange={e => setNewRoomForm({ ...newRoomForm, blockId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                >
                  {blocks.filter(b => b.hostelId === newRoomForm.hostelId).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. A-301"
                    value={newRoomForm.roomNumber}
                    onChange={e => setNewRoomForm({ ...newRoomForm, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Floor</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newRoomForm.floor}
                    onChange={e => setNewRoomForm({ ...newRoomForm, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Type</label>
                  <select
                    value={newRoomForm.roomType}
                    onChange={e => setNewRoomForm({ ...newRoomForm, roomType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="single">Single Seater</option>
                    <option value="double">Double Seater</option>
                    <option value="triple">Triple Seater</option>
                    <option value="quad">Quad Seater</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bed Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newRoomForm.capacity}
                    onChange={e => setNewRoomForm({ ...newRoomForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Create Room & Beds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
