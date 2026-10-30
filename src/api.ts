import { ROLE_PERSONAS } from './types';

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('mwanaweika_token');
  }
  return null;
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('mwanaweika_token', token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('mwanaweika_token');
  }
}

const SCHOOL_ID = 'sch-mwanaweika';
const SCHOOL_NAME = 'Mwanaweika School';
const CURRENCY = 'UGX';

function usernameForRole(role: string): string {
  return role.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export const MOCK_USERS: any[] = ROLE_PERSONAS.map((p, idx) => ({
  id: `usr-${idx + 1}`,
  username: usernameForRole(p.role),
  email: `${usernameForRole(p.role)}@mwanaweika.sc.ug`,
  fullName: p.name,
  role: p.role,
  assignedContext: p.assignedContext,
  assignedClassId: undefined,
  assignedSubjects: undefined,
  isActive: 1,
  schoolId: SCHOOL_ID,
  schoolName: SCHOOL_NAME,
  currency: CURRENCY,
}));

const SUPER_ADMIN = MOCK_USERS.find((u) => u.role === 'Super Administrator')!;

function findUserByUsername(username: string): any | null {
  const u = (username || '').trim().toLowerCase();
  if (!u) return null;
  if (u === 'admin' || u === 'superadmin') return SUPER_ADMIN;
  return (
    MOCK_USERS.find((x) => x.username.toLowerCase() === u || x.email.toLowerCase() === u) ||
    null
  );
}

function makeToken(): string {
  return `mock-token-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const students: any[] = [];
const staff: any[] = [];
const auditLogs: any[] = [
  {
    id: 'log-init',
    user_id: SUPER_ADMIN.id,
    user_name: SUPER_ADMIN.full_name,
    user_role: SUPER_ADMIN.role,
    action: 'SYSTEM_INITIALIZATION',
    module: 'Core',
    details: 'Mwanaweika School Management System running in frontend-only demo mode.',
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString(),
  },
];

const MOCK_DASHBOARD = {
  metrics: {
    totalStudents: 6,
    totalStaff: 15,
    presentToday: 5,
    absentToday: 1,
    attendanceRate: 83,
    feesCollected: 1750000,
    feesPending: 900000,
    recentExpenses: 3050000,
    borrowedBooks: 0,
    transportCount: 0,
    boardersCount: 3,
    clinicVisitsToday: 1,
    counselingSessionsCount: 1,
    stockItemsCount: 3,
  },
  activeAnnouncements: [
    {
      id: 'ann-01',
      title: 'Term I 2026 Consultative Parents-Teachers Conference',
      content: 'We invite all parents to our consultative conference on Saturday 28th March 2026 in the Main Hall.',
      target_audience: 'Parents',
      published_at: new Date().toISOString(),
      expiry_date: '2026-03-29',
    },
  ],
  recentPayments: [],
  classEnrollments: [],
};

const MOCK_ACADEMICS = { classes: [], subjects: [], assessments: [] };

export const api: any = {
  login: async (credentials: { username: string; password?: string }) => {
    const user = findUserByUsername(credentials.username);
    if (!user) {
      throw new Error('Invalid credentials. Please verify your username and password.');
    }
    const token = makeToken();
    setAuthToken(token);
    return { token, user };
  },

  switchRole: async (targetRole: string) => {
    const user = MOCK_USERS.find((u) => u.role === targetRole) || SUPER_ADMIN;
    const token = makeToken();
    setAuthToken(token);
    return { token, user };
  },

  getDashboard: async () => MOCK_DASHBOARD,
  getStudents: async (_params: any = {}) => students,
  getStudentDetails: async (_id: string) => (students[0] ?? null),
  admitStudent: async (data: any) => {
    const id = `std-${Date.now()}`;
    const record = { id, admission_number: `MWK/2026/${students.length + 1}`, ...data };
    students.push(record);
    return { success: true, admission_number: record.admission_number, id };
  },

  getAttendance: async (_params: any) => ({ records: [] }),
  submitAttendance: async (_data: any) => ({ success: true, message: 'Attendance saved (demo mode).' }),

  getAcademicsConfig: async () => MOCK_ACADEMICS,
  getMarks: async (_params: any) => [],
  saveMarks: async (_data: any) => ({ success: true, message: 'Marks saved (demo mode).' }),
  getReportCard: async (_studentId: string) => ({}),

  getFinanceOverview: async () => ({ invoices: [], payments: [], expenses: [] }),
  recordPayment: async (data: any) => ({
    success: true,
    receiptNumber: `RCP-${Date.now()}`,
    ...data,
  }),
  recordExpense: async (data: any) => ({ success: true, id: `exp-${Date.now()}`, ...data }),

  getOperationsData: async () => ({ libraryBooks: [], issues: [], inventory: [], transport: [], hostels: [], timetables: [] }),
  borrowBook: async (data: any) => ({ success: true, issue_id: `iss-${Date.now()}`, ...data }),
  returnBook: async (_issue_id: string) => ({ success: true, message: 'Book returned (demo mode).' }),
  addInventoryItem: async (data: any) => ({ success: true, id: `inv-${Date.now()}`, ...data }),

  getHealthRecords: async () => [],
  recordClinicVisit: async (data: any) => ({ success: true, id: `cln-${Date.now()}`, ...data }),

  getCounselingSessions: async () => [],
  recordCounselingSession: async (data: any) => ({ success: true, id: `cns-${Date.now()}`, ...data }),

  getStaff: async () => staff,
  getHRStaffDirectory: async () => ({ staff, attendance: [] }),
  addStaff: async (data: any) => {
    const record = { id: `stf-${Date.now()}`, staff_number: `STF/MWK/${staff.length + 1}`, ...data };
    staff.push(record);
    return { success: true, id: record.id, staff_number: record.staff_number };
  },

  getParentPortalData: async () => ({}),

  getSchoolSettings: async () => ({}),
  updateSchoolSettings: async (data: any) => ({ success: true, ...data }),
  getAuditLogs: async () => auditLogs,
};

export default api;
