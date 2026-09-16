import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Pin,
  Calendar,
  AlertTriangle,
  Info,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { Announcement } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export const AnnouncementsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [newAnnForm, setNewAnnForm] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    isPinned: false,
    hostelId: undefined as string | undefined,
  });

  const fetchData = async () => {
    try {
      const res = await api.getAnnouncements();
      if (res.success) {
        setAnnouncements(res.announcements);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAnnouncement({
        ...newAnnForm,
        authorName: currentUser?.name || 'Chief Warden',
      });
      if (res.success) {
        setShowAddModal(false);
        setNewAnnForm({
          title: '',
          content: '',
          priority: 'normal',
          isPinned: false,
          hostelId: undefined,
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error publishing notice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Broadcasts & Notice Board</h1>
          <p className="text-xs text-slate-500">Official circulars, curfew advisories & facility notices</p>
        </div>

        {(currentUser?.role === 'admin' || currentUser?.role === 'warden') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      {/* ANNOUNCEMENTS FEED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {announcements.map(ann => {
          const isUrgent = ann.priority === 'urgent';
          const isImportant = ann.priority === 'important';

          return (
            <div
              key={ann.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-colors ${
                isUrgent ? 'border-rose-300 bg-rose-50/10' :
                isImportant ? 'border-amber-300 bg-amber-50/10' :
                'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    {ann.isPinned && <Pin className="w-4 h-4 text-indigo-600 fill-indigo-600" />}
                    <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    isUrgent ? 'bg-rose-100 text-rose-800 border-rose-300' :
                    isImportant ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {ann.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-700 mt-3 leading-relaxed whitespace-pre-line">{ann.content}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-800">By {ann.authorName}</span>
                <span>{new Date(ann.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: PUBLISH NOTICE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Broadcast Notice to Residents</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  placeholder="e.g. Wi-Fi Maintenance Schedule This Sunday"
                  value={newAnnForm.title}
                  onChange={e => setNewAnnForm({ ...newAnnForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Content</label>
                <textarea
                  rows={4}
                  placeholder="Write message to all residents..."
                  value={newAnnForm.content}
                  onChange={e => setNewAnnForm({ ...newAnnForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newAnnForm.priority}
                    onChange={e => setNewAnnForm({ ...newAnnForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAnnForm.isPinned}
                      onChange={e => setNewAnnForm({ ...newAnnForm, isPinned: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Pin to top of board</span>
                  </label>
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
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
