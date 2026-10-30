import React, { useState } from 'react';
import { User, UserRole, ROLE_PERSONAS } from '../types';
import {
  Menu,
  Shield,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onToggleSidebar: () => void;
  onRoleSwitch: (role: UserRole) => void;
  pageTitle: string;
  onOpenTests?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onToggleSidebar,
  onRoleSwitch,
  pageTitle,
  onOpenTests,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left zone: Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{pageTitle}</h2>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Mukono Campus</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-blue-700">{currentUser.role}</span>
          </div>
        </div>
      </div>

      {/* Right zone: Switch Persona Dropdown & Security Test Suite */}
      <div className="flex items-center gap-2">
        {onOpenTests && (
          <button
            onClick={onOpenTests}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Verify Permissions (20 Roles)</span>
          </button>
        )}

        {/* Persona Switcher Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="text-blue-950 font-bold truncate max-w-[120px] sm:max-w-none">{currentUser.role}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 max-h-[420px] overflow-y-auto">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Switch Authorized Persona (20 Roles)</p>
                <p className="text-[10px] text-slate-500">Updates JWT token & backend data permissions immediately.</p>
              </div>

              <div className="space-y-1">
                {ROLE_PERSONAS.map((p) => {
                  const isCurrent = currentUser.role === p.role;
                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => {
                        setShowPersonaMenu(false);
                        onRoleSwitch(p.role);
                      }}
                      className={`w-full text-left p-2 rounded-lg transition-colors text-xs flex flex-col ${
                        isCurrent
                          ? 'bg-blue-50 border border-blue-300'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${isCurrent ? 'text-blue-800' : 'text-slate-900'}`}>
                          {p.role}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">
                          {p.category.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">{p.name} · {p.assignedContext}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
            {currentUser.fullName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
