import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Package
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { InventoryItem } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export const InventoryView: React.FC = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [newItemForm, setNewItemForm] = useState({
    name: '',
    category: 'furniture',
    hostelId: 'h-1',
    quantity: 10,
    availableQuantity: 10,
    unit: 'units',
    condition: 'good' as 'good' | 'fair' | 'damaged',
    locationDescription: 'Common Hall Storage',
  });

  const fetchData = async () => {
    try {
      const res = await api.getInventory();
      if (res.success) {
        setItems(res.inventory);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createInventory(newItemForm);
      if (res.success) {
        setShowAddModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error adding inventory item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Inventory & Physical Assets</h1>
          <p className="text-xs text-slate-500">Track furniture, kitchen equipment, mattresses & electronic appliances</p>
        </div>

        {(currentUser?.role === 'admin' || currentUser?.role === 'staff') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset Item</span>
          </button>
        )}
      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Asset Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Total Qty</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <Package className="w-4 h-4" />
                    </div>
                    <span>{item.name}</span>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{item.category}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3 font-medium text-emerald-700">{item.availableQuantity} {item.unit}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.condition === 'good' ? 'bg-emerald-100 text-emerald-800' :
                      item.condition === 'fair' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.locationDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD ASSET */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Inventory Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateItem} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ergonomic Study Chairs"
                  value={newItemForm.name}
                  onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItemForm.category}
                    onChange={e => setNewItemForm({ ...newItemForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="furniture">Furniture</option>
                    <option value="appliance">Appliance</option>
                    <option value="mess_equipment">Mess Equipment</option>
                    <option value="sports">Sports & Recreation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemForm.quantity}
                    onChange={e => setNewItemForm({ ...newItemForm, quantity: Number(e.target.value), availableQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Store Room</label>
                <input
                  type="text"
                  placeholder="e.g. Block B Ground Floor Utility Closet"
                  value={newItemForm.locationDescription}
                  onChange={e => setNewItemForm({ ...newItemForm, locationDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
