import React from 'react';
import { User, UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  CreditCard,
  Briefcase,
  BookOpen,
  Bus,
  BedDouble,
  Boxes,
  Stethoscope,
  Heart,
  Settings,
  HeartHandshake,
  LogOut,
  ChevronRight,
  ShieldAlert,
  ClipboardList,
  DollarSign
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenTests?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  collapsed,
  onOpenTests,
}) => {
  const role = currentUser.role;

  // Custom Navigation list strictly tailored to authorized modules per role
  const allNavDefinitions = [
    {
      id: 'dashboard',
      label: 'Personalized Dashboard',
      icon: LayoutDashboard,
      roles: [
        'Super Administrator', 'School Administrator', 'Head Teacher', 'Deputy Head Teacher',
        'Director', 'Academic Registrar', 'Class Teacher', 'Subject Teacher', 'Bursar',
        'Cashier', 'Admissions Officer', 'Human Resource Officer', 'Librarian',
        'Transport Officer', 'Storekeeper', 'Hostel Warden', 'School Nurse', 'Counselor'
      ]
    },
    {
      id: 'students',
      label: 'Learners Registry & Roster',
      icon: Users,
      roles: [
        'Super Administrator', 'School Administrator', 'Head Teacher', 'Deputy Head Teacher',
        'Academic Registrar', 'Class Teacher', 'Admissions Officer'
      ]
    },
    {
      id: 'attendance',
      label: 'Class Attendance Registers',
      icon: CalendarCheck,
      roles: [
        'Super Administrator', 'School Administrator', 'Head Teacher', 'Deputy Head Teacher',
        'Academic Registrar', 'Class Teacher'
      ]
    },
    {
      id: 'academics',
      label: 'Assessments & Marksheets',
      icon: GraduationCap,
      roles: [
        'Super Administrator', 'School Administrator', 'Head Teacher', 'Deputy Head Teacher',
        'Academic Registrar', 'Subject Teacher'
      ]
    },
    {
      id: 'finance',
      label: 'Fees & Accounting (UGX)',
      icon: CreditCard,
      roles: ['Super Administrator', 'School Administrator', 'Head Teacher', 'Director', 'Bursar', 'Cashier']
    },
    {
      id: 'operations',
      label: 'School Operations',
      icon: Boxes,
      roles: [
        'Super Administrator', 'School Administrator', 'Head Teacher', 'Deputy Head Teacher',
        'Librarian', 'Transport Officer', 'Storekeeper', 'Hostel Warden'
      ]
    },
    {
      id: 'health',
      label: 'Sickbay & Clinic Records',
      icon: Stethoscope,
      roles: ['Super Administrator', 'School Administrator', 'Head Teacher', 'School Nurse']
    },
    {
      id: 'counseling',
      label: 'Guidance & Counseling',
      icon: Heart,
      roles: ['Super Administrator', 'School Administrator', 'Head Teacher', 'Counselor']
    },
    {
      id: 'staff',
      label: 'Faculty & HR Management',
      icon: Briefcase,
      roles: ['Super Administrator', 'School Administrator', 'Head Teacher', 'Human Resource Officer']
    },
    {
      id: 'parent-portal',
      label: 'Guardian & Parent Portal',
      icon: HeartHandshake,
      roles: ['Parent', 'Super Administrator']
    },
    {
      id: 'student-portal',
      label: 'Student Portal Self-Service',
      icon: BookOpen,
      roles: ['Student', 'Super Administrator']
    },
    {
      id: 'settings',
      label: 'System & Audit Security',
      icon: Settings,
      roles: ['Super Administrator', 'School Administrator']
    },
  ];

  const authorizedNavItems = allNavDefinitions.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-slate-900 text-slate-200 border-r border-slate-800 z-30 transition-all duration-200 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <img
          src="/src/assets/images/school_emblem_crest_1793336318439.jpg"
          alt="Mwanaweika School Crest"
          className="w-10 h-10 object-contain rounded-md shrink-0 bg-white/5 p-0.5 border border-amber-500/30"
          referrerPolicy="no-referrer"
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold tracking-tight text-white truncate">
              Mwanaweika SMS
            </h1>
            <p className="text-[11px] text-slate-400 truncate">Mukono · 20 Roles Enforced</p>
          </div>
        )}
      </div>

      {/* Role Context Pill */}
      {!collapsed && (
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Role</span>
          <p className="text-emerald-400 font-bold truncate">{currentUser.role}</p>
          {currentUser.assignedContext && (
            <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">{currentUser.assignedContext}</p>
          )}
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {authorizedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate flex-1">{item.label}</span>}
              {!collapsed && isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
            </button>
          );
        })}

        {/* Security Role Test Suite Action */}
        {onOpenTests && (
          <div className="pt-3 mt-3 border-t border-slate-800">
            <button
              onClick={onOpenTests}
              className="w-full flex items-center gap-2.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors"
              title="Run Automated Security Tests"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              {!collapsed && <span>Verify 20-Role Security</span>}
            </button>
          </div>
        )}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        {!collapsed && (
          <div className="mb-2 px-2 py-1.5 rounded-md bg-slate-800/40 border border-slate-800 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentUser.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Switch Persona / Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
