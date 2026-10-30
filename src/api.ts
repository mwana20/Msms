const API_BASE = typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api';

let memoryToken: string | null = null;

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('mwanaweika_token');
  }
  return memoryToken;
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('mwanaweika_token', token);
  }
  memoryToken = token;
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('mwanaweika_token');
  }
  memoryToken = null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorBody.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (credentials: { username: string; password?: string }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  switchRole: async (targetRole: string) => {
    const res = await request<{ token: string; user: any }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ targetRole }),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  // Dashboard
  getDashboard: () => request<any>('/dashboard/summary'),

  // Students
  getStudents: (params: { class_id?: string; search?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.class_id) query.append('class_id', params.class_id);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    return request<any[]>(`/students?${query.toString()}`);
  },

  getStudentDetails: (id: string) => request<any>(`/students/${id}`),

  admitStudent: (data: any) =>
    request<any>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Attendance
  getAttendance: (params: { class_id: string; stream_id?: string; date?: string }) => {
    const query = new URLSearchParams();
    query.append('class_id', params.class_id);
    if (params.stream_id) query.append('stream_id', params.stream_id);
    if (params.date) query.append('date', params.date);
    return request<any>(`/attendance?${query.toString()}`);
  },

  submitAttendance: (data: { class_id: string; stream_id?: string; date: string; records: any[] }) =>
    request<any>('/attendance/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Academics
  getAcademicsConfig: () => request<any>('/academics/config'),

  getMarks: (params: { assessment_id: string; class_id: string; subject_id: string }) => {
    const query = new URLSearchParams();
    query.append('assessment_id', params.assessment_id);
    query.append('class_id', params.class_id);
    query.append('subject_id', params.subject_id);
    return request<any[]>(`/academics/marks?${query.toString()}`);
  },

  saveMarks: (data: { assessment_id: string; class_id: string; subject_id: string; marks: any[] }) =>
    request<any>('/academics/marks/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getReportCard: (studentId: string) => request<any>(`/academics/report-card/${studentId}`),

  // Finance
  getFinanceOverview: () => request<any>('/finance/overview'),

  recordPayment: (data: {
    invoice_id: string;
    student_id: string;
    amount: number;
    payment_method: string;
    reference_code?: string;
    notes?: string;
  }) =>
    request<any>('/finance/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  recordExpense: (data: any) =>
    request<any>('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Operations
  getOperationsData: () => request<any>('/operations/data'),

  borrowBook: (data: { book_id: string; student_id: string; due_days?: number }) =>
    request<any>('/operations/library/borrow', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  returnBook: (issue_id: string) =>
    request<any>('/operations/library/return', {
      method: 'POST',
      body: JSON.stringify({ issue_id }),
    }),

  addInventoryItem: (data: any) =>
    request<any>('/operations/inventory/add', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Health & Sickbay (School Nurse)
  getHealthRecords: () => request<any[]>('/health/records'),
  recordClinicVisit: (data: any) =>
    request<any>('/health/records', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Counseling (Rev. Sister Florence)
  getCounselingSessions: () => request<any[]>('/counseling/sessions'),
  recordCounselingSession: (data: any) =>
    request<any>('/counseling/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Staff & HR
  getStaff: () => request<any[]>('/staff'),
  getHRStaffDirectory: () => request<any>('/hr/staff'),
  addStaff: (data: any) =>
    request<any>('/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Parent Portal
  getParentPortalData: () => request<any>('/parent/portal-data'),

  // Settings & Audit
  getSchoolSettings: () => request<any>('/school/settings'),
  updateSchoolSettings: (data: any) =>
    request<any>('/school/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAuditLogs: () => request<any[]>('/audit-logs'),
};
