export type UserRole =
  // A. Leadership and Administration
  | 'Super Administrator'
  | 'School Administrator'
  | 'Head Teacher'
  | 'Deputy Head Teacher'
  | 'Director'
  | 'Academic Registrar'
  // B. Teaching
  | 'Class Teacher'
  | 'Subject Teacher'
  // C. Finance
  | 'Bursar'
  | 'Cashier'
  // D. Admissions and Human Resources
  | 'Admissions Officer'
  | 'Human Resource Officer'
  // E. Operations
  | 'Librarian'
  | 'Transport Officer'
  | 'Storekeeper'
  | 'Hostel Warden'
  // F. Health and Welfare
  | 'School Nurse'
  | 'Counselor'
  // G. Community Portals
  | 'Parent'
  | 'Student';

export interface RolePersona {
  role: UserRole;
  name: string;
  assignedContext?: string;
  description: string;
  category: 'Leadership & Administration' | 'Teaching' | 'Finance' | 'Admissions & HR' | 'Operations' | 'Health & Welfare' | 'Community Portals';
}

export const ROLE_PERSONAS: RolePersona[] = [
  // A. Leadership & Administration
  {
    role: 'Super Administrator',
    name: 'Platform Systems Admin',
    assignedContext: 'Platform Level Operations',
    description: 'System-wide configuration, multi-school isolation, audit monitoring, platform security policies.',
    category: 'Leadership & Administration'
  },
  {
    role: 'School Administrator',
    name: 'Eng. Ronald Ssekandi',
    assignedContext: 'Mwanaweika Mukono Campus',
    description: 'School-level settings, module configuration, staff credentials, school-wide reports.',
    category: 'Leadership & Administration'
  },
  {
    role: 'Head Teacher',
    name: 'Dr. Phillip Mwanaweika',
    assignedContext: 'Executive Principal',
    description: 'School-wide academic & operational supervision, curriculum approvals, executive oversight.',
    category: 'Leadership & Administration'
  },
  {
    role: 'Deputy Head Teacher',
    name: 'Mr. Patrick Kibuuka',
    assignedContext: 'Academics & Operations Supervision',
    description: 'Teacher activity monitoring, delegated academic approvals, departmental coordination.',
    category: 'Leadership & Administration'
  },
  {
    role: 'Director',
    name: 'Hon. Beatrice Namugwanya',
    assignedContext: 'School Owner & Board of Governors',
    description: 'Strategic management oversight, enrollment & revenue performance trends, high-level governance.',
    category: 'Leadership & Administration'
  },
  {
    role: 'Academic Registrar',
    name: 'Dr. Anthony Mwesigwa',
    assignedContext: 'Registry & Examination Office',
    description: 'Syllabus coverage, exam timetabling, transcript certification, UNEB results verification.',
    category: 'Leadership & Administration'
  },

  // B. Teaching
  {
    role: 'Class Teacher',
    name: 'Ms. Rebecca Akello',
    assignedContext: 'Assigned: S.3 Blue',
    description: 'Class register attendance, student welfare, progress monitoring for assigned class S.3 Blue.',
    category: 'Teaching'
  },
  {
    role: 'Subject Teacher',
    name: 'Mr. Emmanuel Byamukama',
    assignedContext: 'Assigned: Physics & Mathematics (S.3, S.4)',
    description: 'Assessment scoring, marks entry, lesson plan submissions for assigned Physics & Mathematics.',
    category: 'Teaching'
  },

  // C. Finance
  {
    role: 'Bursar',
    name: 'CPA Grace Nakimera',
    assignedContext: 'Senior Bursar & Chief Accountant',
    description: 'Fee structures, invoices, cashbook ledger, bank reconciliations, expenditures, financial audits.',
    category: 'Finance'
  },
  {
    role: 'Cashier',
    name: 'Mr. Isaac Mukasa',
    assignedContext: 'Accounts Office Counter',
    description: 'Receive school fees, generate official receipts, daily collection batches (strictly restricted from fee editing).',
    category: 'Finance'
  },

  // D. Admissions & HR
  {
    role: 'Admissions Officer',
    name: 'Mrs. Stella Nalubega',
    assignedContext: 'Admissions & Inquiries Center',
    description: 'Inquiries, application vetting, student admissions, LIN registration, enrollment letters.',
    category: 'Admissions & HR'
  },
  {
    role: 'Human Resource Officer',
    name: 'Ms. Brenda Kyomugisha',
    assignedContext: 'HR & Personnel Office',
    description: 'Staff directory, confidential contracts, staff clock-in attendance, leave tracking.',
    category: 'Admissions & HR'
  },

  // E. Operations
  {
    role: 'Librarian',
    name: 'Mr. Godfrey Ssenabulya',
    assignedContext: 'Main School Library',
    description: 'Book cataloging, copy tracking, circulation, lending, return check-in, overdue tracking.',
    category: 'Operations'
  },
  {
    role: 'Transport Officer',
    name: 'Mr. Charles Walusimbi',
    assignedContext: 'Transport & Fleet Depot',
    description: 'School bus fleet, drivers, routes, passenger allocations, pickup schedule oversight.',
    category: 'Operations'
  },
  {
    role: 'Storekeeper',
    name: 'Mr. Joseph Ochieng',
    assignedContext: 'Central Inventory Store',
    description: 'Consumables, stock requisitions, stock issues, supplier orders, reorder thresholds.',
    category: 'Operations'
  },
  {
    role: 'Hostel Warden',
    name: 'Mr. James Kasozi',
    assignedContext: 'Boarding Section (Hostels)',
    description: 'Dormitory blocks, bed allocations, boarding roll call, hostel inspection records.',
    category: 'Operations'
  },

  // F. Health & Welfare
  {
    role: 'School Nurse',
    name: 'Nurse Juliet Nabirye',
    assignedContext: 'School Clinic & Sickbay',
    description: 'Confidential clinical visits, allergy records, medical follow-ups, sickbay admissions.',
    category: 'Health & Welfare'
  },
  {
    role: 'Counselor',
    name: 'Rev. Sister Florence Namutebi',
    assignedContext: 'Guidance & Counseling Department',
    description: 'Confidential student counseling sessions, psycho-social welfare follow-ups, student care notes.',
    category: 'Health & Welfare'
  },

  // G. Community Portals
  {
    role: 'Parent',
    name: 'Mrs. Sarah Namubiru',
    assignedContext: 'Children: Brian Kato (S.3 Blue) & Joshua Kigozi (P.7 Cranes)',
    description: 'Multi-child switcher, monitor attendance, terminal report cards, fee balances & receipts.',
    category: 'Community Portals'
  },
  {
    role: 'Student',
    name: 'Brian Kato',
    assignedContext: 'Learner: S.3 Blue (Adm: MWK/2026/0146)',
    description: 'Personal learner profile, class timetable, examination grades, attendance history, announcements.',
    category: 'Community Portals'
  }
];

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  assignedContext?: string;
  phone?: string;
  schoolId: string;
  schoolName: string;
  currency: string;
  guardianData?: any;
  studentData?: any;
  assignedClassId?: string;
  assignedSubjects?: string[];
}

export interface Student {
  id: string;
  school_id: string;
  admission_number: string;
  lin?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  dob: string;
  enrollment_date: string;
  class_id: string;
  stream_id?: string;
  class_name?: string;
  class_code?: string;
  stream_name?: string;
  boarding_status: 'Day' | 'Boarder';
  status: 'Active' | 'Graduated' | 'Transferred' | 'Suspended';
  medical_notes?: string;
  district?: string;
  address?: string;
  outstanding_balance?: number;
}

export interface SchoolClass {
  id: string;
  school_id: string;
  name: string;
  code: string;
  level: string;
  order_index: number;
}

export interface Stream {
  id: string;
  class_id: string;
  name: string;
  capacity: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: string;
}

export interface Assessment {
  id: string;
  name: string;
  type: string;
  weight_percentage: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  student_id: string;
  first_name?: string;
  last_name?: string;
  admission_number?: string;
  class_name?: string;
  total_amount: number;
  payable_amount: number;
  balance: number;
  due_date: string;
  status: 'Unpaid' | 'Partially Paid' | 'Paid';
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  student_id: string;
  first_name?: string;
  last_name?: string;
  admission_number?: string;
  invoice_number?: string;
  receipt_number: string;
  amount: number;
  currency: string;
  payment_method: string;
  reference_code?: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  currency: string;
  payment_method: string;
  recipient: string;
  reference_no?: string;
  description: string;
  date: string;
}

export interface Staff {
  id: string;
  staff_number: string;
  first_name: string;
  last_name: string;
  designation: string;
  department: string;
  phone: string;
  email?: string;
  qualification: string;
  employment_date: string;
  status: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  total_copies: number;
  available_copies: number;
  shelf_location?: string;
}

export interface LibraryIssue {
  id: string;
  book_id: string;
  book_title: string;
  author: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  issued_date: string;
  due_date: string;
  return_date?: string;
  status: 'Borrowed' | 'Returned' | 'Overdue';
}

export interface TransportRoute {
  id: string;
  route_name: string;
  pickup_points: string;
  vehicle_reg: string;
  driver_name: string;
  driver_phone: string;
  fee_amount: number;
  capacity: number;
  passenger_count: number;
}

export interface Hostel {
  id: string;
  name: string;
  gender: string;
  warden_name: string;
  warden_phone: string;
  capacity: number;
  occupied_beds: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorder_level: number;
  unit_cost: number;
}

export interface TimetableSlot {
  id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  teacher_id?: string;
  teacher_first?: string;
  teacher_last?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_name?: string;
}

export interface ClinicVisit {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  visit_date: string;
  complaint: string;
  treatment: string;
  attending_nurse: string;
  parent_notified: number;
}

export interface CounselingSession {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  session_date: string;
  session_topic: string;
  notes: string;
  counselor_name: string;
  follow_up_required: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_audience: string;
  published_at: string;
  expiry_date?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  user_role?: string;
  action: string;
  module: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}
