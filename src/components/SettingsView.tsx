import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { AuditLog } from '../types';
import {
  Settings,
  ShieldCheck,
  Save,
  CheckCircle2,
  FileText,
  Activity,
  Calendar,
  Building2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'audit'>('settings');
  const [settings, setSettings] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSettingsAndAudit = async () => {
    setLoading(true);
    try {
      const [s, logs] = await Promise.all([api.getSchoolSettings(), api.getAuditLogs()]);
      setSettings(s);
      setAuditLogs(logs);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndAudit();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSchoolSettings(settings);
      setMessage('School settings and configuration updated.');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Settings update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Header and Subtabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-blue-600" />
            <span>School Configuration</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Security Audit Logs ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading settings...</div>
      ) : activeTab === 'settings' ? (
        /* SCHOOL SETTINGS FORM */
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-3xl">
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Institutional Profile</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={settings?.name || ''}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Motto</label>
                <input
                  type="text"
                  value={settings?.motto || ''}
                  onChange={(e) => setSettings({ ...settings, motto: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Physical Address & Location</label>
              <input
                type="text"
                value={settings?.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">School Phone</label>
                <input
                  type="text"
                  value={settings?.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-slate-700"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={settings?.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-slate-700"
                />
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-900 border-b pb-2 pt-4">Academic Session Parameters</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Active Academic Year</label>
                <input
                  type="text"
                  value={settings?.academic_year_active || '2026'}
                  onChange={(e) => setSettings({ ...settings, academic_year_active: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-slate-700"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Active Term</label>
                <input
                  type="text"
                  value={settings?.term_active || 'Term I'}
                  onChange={(e) => setSettings({ ...settings, term_active: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-slate-700"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* AUDIT LOGS TABLE */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase">System Activity & Audit Trail</span>
            <span className="text-xs text-slate-500 font-mono">Immutable Log</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Module</th>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-blue-900">{l.action}</td>
                    <td className="py-2.5 px-4 text-slate-600">{l.module}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-900 font-medium">
                      {l.user_name || 'System'} ({l.user_role || 'Daemon'})
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-700 text-[11px] max-w-md">
                      {l.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
