import React, { useState, useEffect } from 'react';
import { api, getAuthToken, clearAuthToken } from './api';
import { User, UserRole, SchoolClass, Subject, Assessment } from './types';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { AttendanceView } from './components/AttendanceView';
import { AcademicsView } from './components/AcademicsView';
import { FinanceView } from './components/FinanceView';
import { OperationsView } from './components/OperationsView';
import { StaffView } from './components/StaffView';
import { HealthView } from './components/HealthView';
import { CounselingView } from './components/CounselingView';
import { ParentPortalView } from './components/ParentPortalView';
import { StudentPortalView } from './components/StudentPortalView';
import { SettingsView } from './components/SettingsView';
import { ReportCardModal } from './components/ReportCardModal';
import { SecurityModal } from './components/SecurityModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState<any | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [reportCardStudentId, setReportCardStudentId] = useState<string | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Auto-login default demo user (Super Admin) on mount for immediate interactive preview
  useEffect(() => {
    async function initSession() {
      try {
        const res = await api.login({ username: 'admin', password: 'Mwanaweika@2026' });
        setCurrentUser(res.user);
        await loadCoreData();
      } catch (err) {
        console.warn('Auto-login notice:', err);
      } finally {
        setInitialLoading(false);
      }
    }
    initSession();
  }, []);

  const loadCoreData = async () => {
    try {
      const [sum, aca] = await Promise.all([api.getDashboard(), api.getAcademicsConfig()]);
      setDashboardSummary(sum);
      setClasses(aca.classes || []);
      setSubjects(aca.subjects || []);
      setAssessments(aca.assessments || []);
    } catch (err) {
      console.error('Failed loading core data:', err);
    }
  };

  const handleRoleSwitch = async (role: UserRole) => {
    try {
      const res = await api.switchRole(role);
      setCurrentUser(res.user);
      // Route to role default
      if (role === 'Parent') {
        setCurrentTab('parent-portal');
      } else if (role === 'Student') {
        setCurrentTab('student-portal');
      } else if (role === 'Class Teacher') {
        setCurrentTab('attendance');
      } else if (role === 'Subject Teacher') {
        setCurrentTab('academics');
      } else if (role === 'Bursar' || role === 'Cashier') {
        setCurrentTab('finance');
      } else if (role === 'School Nurse') {
        setCurrentTab('health');
      } else if (role === 'Counselor') {
        setCurrentTab('counseling');
      } else if (role === 'Admissions Officer') {
        setCurrentTab('students');
      } else if (role === 'Human Resource Officer') {
        setCurrentTab('staff');
      } else if (['Librarian', 'Transport Officer', 'Storekeeper', 'Hostel Warden'].includes(role)) {
        setCurrentTab('operations');
      } else {
        setCurrentTab('dashboard');
      }
      loadCoreData();
    } catch (err: any) {
      alert(err.message || 'Failed switching role');
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Starting Mwanaweika School Management System...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal onSuccess={(u) => { setCurrentUser(u); loadCoreData(); }} />;
  }

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'School Operations & Analytics';
      case 'students': return 'Learners Directory & Admissions';
      case 'attendance': return 'Student & Staff Attendance Registers';
      case 'academics': return 'Assessments, UNEB Grading & Report Cards';
      case 'finance': return 'School Fees, Accounting & Cashbook (UGX)';
      case 'operations': return 'Library, Transport, Boarding & Store';
      case 'health': return 'Sickbay & Clinic Consultation Registers';
      case 'counseling': return 'Confidential Guidance & Counseling Sessions';
      case 'staff': return 'Faculty & Human Resource Personnel';
      case 'parent-portal': return 'Parent & Guardian Portal';
      case 'student-portal': return 'Student Portal Self-Service';
      case 'settings': return 'School Settings & Security Audit Trail';
      default: return 'Mwanaweika School Management System';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenTests={() => setShowSecurityModal(true)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header
          currentUser={currentUser}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onRoleSwitch={handleRoleSwitch}
          pageTitle={getPageTitle()}
          onOpenTests={() => setShowSecurityModal(true)}
        />

        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              summary={dashboardSummary}
              currentUser={currentUser}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenTests={() => setShowSecurityModal(true)}
            />
          )}

          {currentTab === 'students' && (
            <StudentsView
              classes={classes}
              onOpenReportCard={(studentId) => setReportCardStudentId(studentId)}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendanceView classes={classes} />
          )}

          {currentTab === 'academics' && (
            <AcademicsView
              classes={classes}
              subjects={subjects}
              assessments={assessments}
              onOpenReportCard={(studentId) => setReportCardStudentId(studentId)}
            />
          )}

          {currentTab === 'finance' && (
            <FinanceView />
          )}

          {currentTab === 'operations' && (
            <OperationsView />
          )}

          {currentTab === 'health' && (
            <HealthView currentUser={currentUser} />
          )}

          {currentTab === 'counseling' && (
            <CounselingView currentUser={currentUser} />
          )}

          {currentTab === 'staff' && (
            <StaffView />
          )}

          {currentTab === 'parent-portal' && (
            <ParentPortalView
              currentUser={currentUser}
              onOpenReportCard={(studentId) => setReportCardStudentId(studentId)}
            />
          )}

          {currentTab === 'student-portal' && (
            <StudentPortalView
              currentUser={currentUser}
              onOpenReportCard={(studentId) => setReportCardStudentId(studentId)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Report Card Modal */}
      {reportCardStudentId && (
        <ReportCardModal
          studentId={reportCardStudentId}
          onClose={() => setReportCardStudentId(null)}
        />
      )}

      {/* Security Role Verification Modal */}
      {showSecurityModal && (
        <SecurityModal
          onClose={() => setShowSecurityModal(false)}
          onRefreshRole={() => loadCoreData()}
        />
      )}
    </div>
  );
}
