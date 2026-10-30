import React, { useState } from 'react';
import { api } from '../api';
import { User, UserRole, ROLE_PERSONAS } from '../types';
import { School, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('Mwanaweika@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Leadership & Administration',
    'Teaching',
    'Finance',
    'Admissions & HR',
    'Operations',
    'Health & Welfare',
    'Community Portals'
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ username, password });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.switchRole(role);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Switching role failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredPersonas = selectedCategory === 'All'
    ? ROLE_PERSONAS
    : ROLE_PERSONAS.filter(p => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white text-center relative">
          <div className="mx-auto w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <School className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Mwanaweika School Management System</h2>
          <p className="text-xs text-slate-300 mt-1">Mukono, Uganda · All 20 Individual Roles & Personas</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Backend-Enforced Role Separation</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Credential Form */}
          <form onSubmit={handleLogin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Username / Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                placeholder="superadmin"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-1.5 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Persona Switcher for All 20 Roles */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Select Any of the 20 Authorized Personas to Test</h3>
                <p className="text-[11px] text-slate-500">Each role authenticates with distinct permissions, navigation, and backend data access boundaries.</p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors ${
                      selectedCategory === cat ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto p-1">
              {filteredPersonas.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleQuickRole(p.role)}
                  disabled={loading}
                  className="p-3 text-left border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 rounded-xl transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                      {p.role}
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-tight">{p.description}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono truncate">
                    {p.assignedContext}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
