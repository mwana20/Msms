import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'school.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- Schools
    CREATE TABLE IF NOT EXISTS schools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      motto TEXT,
      address TEXT NOT NULL,
      district TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'Uganda',
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'UGX',
      logo_url TEXT,
      academic_year_active TEXT,
      term_active TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Users & Roles (Supporting all 20 Roles)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      assigned_context TEXT,
      phone TEXT,
      assigned_class_id TEXT,
      assigned_subjects TEXT, -- JSON array of subject IDs
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Academic Years
    CREATE TABLE IF NOT EXISTS academic_years (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      name TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 0
    );

    -- Terms
    CREATE TABLE IF NOT EXISTS terms (
      id TEXT PRIMARY KEY,
      academic_year_id TEXT NOT NULL REFERENCES academic_years(id),
      name TEXT NOT NULL,
      term_number INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 0
    );

    -- Classes (P.1 - P.7 / S.1 - S.6)
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      level TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    -- Streams
    CREATE TABLE IF NOT EXISTS streams (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL REFERENCES classes(id),
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 50,
      class_teacher_id TEXT REFERENCES users(id)
    );

    -- Subjects
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    -- Guardians / Parents
    CREATE TABLE IF NOT EXISTS guardians (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      user_id TEXT REFERENCES users(id),
      full_name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      phone TEXT NOT NULL,
      alt_phone TEXT,
      email TEXT,
      physical_address TEXT,
      national_id TEXT,
      is_verified INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Students
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      admission_number TEXT UNIQUE NOT NULL,
      lin TEXT,
      first_name TEXT NOT NULL,
      middle_name TEXT,
      last_name TEXT NOT NULL,
      gender TEXT NOT NULL,
      dob DATE NOT NULL,
      nationality TEXT NOT NULL DEFAULT 'Ugandan',
      district TEXT,
      address TEXT,
      enrollment_date DATE NOT NULL,
      class_id TEXT NOT NULL REFERENCES classes(id),
      stream_id TEXT REFERENCES streams(id),
      boarding_status TEXT NOT NULL DEFAULT 'Day',
      status TEXT NOT NULL DEFAULT 'Active',
      medical_notes TEXT,
      special_needs TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Student Guardians Bridge (Many-to-Many)
    CREATE TABLE IF NOT EXISTS student_guardians (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id),
      guardian_id TEXT NOT NULL REFERENCES guardians(id),
      is_primary INTEGER NOT NULL DEFAULT 1,
      pickup_authorized INTEGER NOT NULL DEFAULT 1
    );

    -- Staff Members
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      user_id TEXT UNIQUE REFERENCES users(id),
      staff_number TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      designation TEXT NOT NULL,
      department TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      qualification TEXT,
      employment_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active'
    );

    -- Teacher Allocations
    CREATE TABLE IF NOT EXISTS teacher_allocations (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL REFERENCES staff(id),
      class_id TEXT NOT NULL REFERENCES classes(id),
      stream_id TEXT REFERENCES streams(id),
      subject_id TEXT NOT NULL REFERENCES subjects(id),
      academic_year_id TEXT NOT NULL REFERENCES academic_years(id)
    );

    -- Student Attendance
    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id),
      class_id TEXT NOT NULL REFERENCES classes(id),
      stream_id TEXT REFERENCES streams(id),
      date DATE NOT NULL,
      session TEXT NOT NULL DEFAULT 'Morning',
      status TEXT NOT NULL,
      reason TEXT,
      marked_by TEXT NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, date, session)
    );

    -- Staff Attendance
    CREATE TABLE IF NOT EXISTS staff_attendance (
      id TEXT PRIMARY KEY,
      staff_id TEXT NOT NULL REFERENCES staff(id),
      date DATE NOT NULL,
      clock_in TIME,
      clock_out TIME,
      status TEXT NOT NULL,
      notes TEXT,
      marked_by TEXT NOT NULL REFERENCES users(id),
      UNIQUE(staff_id, date)
    );

    -- Staff Leave Records
    CREATE TABLE IF NOT EXISTS staff_leave (
      id TEXT PRIMARY KEY,
      staff_id TEXT NOT NULL REFERENCES staff(id),
      leave_type TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      approved_by TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Assessments
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      term_id TEXT NOT NULL REFERENCES terms(id),
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      weight_percentage REAL NOT NULL DEFAULT 100,
      academic_year_id TEXT NOT NULL REFERENCES academic_years(id)
    );

    -- Marks
    CREATE TABLE IF NOT EXISTS marks (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL REFERENCES assessments(id),
      student_id TEXT NOT NULL REFERENCES students(id),
      subject_id TEXT NOT NULL REFERENCES subjects(id),
      class_id TEXT NOT NULL REFERENCES classes(id),
      score REAL,
      max_score REAL NOT NULL DEFAULT 100,
      grade TEXT,
      descriptor TEXT,
      teacher_comment TEXT,
      entered_by TEXT NOT NULL REFERENCES users(id),
      approved INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(assessment_id, student_id, subject_id)
    );

    -- Fee Structures
    CREATE TABLE IF NOT EXISTS fee_structures (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      academic_year_id TEXT NOT NULL REFERENCES academic_years(id),
      term_id TEXT NOT NULL REFERENCES terms(id),
      class_id TEXT NOT NULL REFERENCES classes(id),
      category TEXT NOT NULL DEFAULT 'Tuition',
      boarding_status TEXT NOT NULL DEFAULT 'All',
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'UGX'
    );

    -- Invoices
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      student_id TEXT NOT NULL REFERENCES students(id),
      invoice_number TEXT UNIQUE NOT NULL,
      term_id TEXT NOT NULL REFERENCES terms(id),
      academic_year_id TEXT NOT NULL REFERENCES academic_years(id),
      total_amount REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      payable_amount REAL NOT NULL,
      balance REAL NOT NULL,
      due_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'Unpaid',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Payments & Receipts
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES invoices(id),
      student_id TEXT NOT NULL REFERENCES students(id),
      receipt_number TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'UGX',
      payment_method TEXT NOT NULL,
      reference_code TEXT,
      notes TEXT,
      received_by TEXT NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Expenses / Cashbook
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'UGX',
      payment_method TEXT NOT NULL,
      recipient TEXT NOT NULL,
      reference_no TEXT,
      description TEXT NOT NULL,
      recorded_by TEXT NOT NULL REFERENCES users(id),
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Timetable Slots
    CREATE TABLE IF NOT EXISTS timetable_slots (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL REFERENCES classes(id),
      stream_id TEXT REFERENCES streams(id),
      subject_id TEXT NOT NULL REFERENCES subjects(id),
      teacher_id TEXT REFERENCES staff(id),
      day_of_week TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room_name TEXT
    );

    -- Library Books
    CREATE TABLE IF NOT EXISTS library_books (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT,
      category TEXT NOT NULL,
      total_copies INTEGER NOT NULL DEFAULT 1,
      available_copies INTEGER NOT NULL DEFAULT 1,
      shelf_location TEXT
    );

    -- Library Issues
    CREATE TABLE IF NOT EXISTS library_issues (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES library_books(id),
      student_id TEXT NOT NULL REFERENCES students(id),
      issued_date DATE NOT NULL,
      due_date DATE NOT NULL,
      return_date DATE,
      status TEXT NOT NULL DEFAULT 'Borrowed',
      fine_amount REAL DEFAULT 0,
      issued_by TEXT NOT NULL REFERENCES users(id)
    );

    -- Transport Routes
    CREATE TABLE IF NOT EXISTS transport_routes (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      route_name TEXT NOT NULL,
      pickup_points TEXT NOT NULL,
      vehicle_reg TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      driver_phone TEXT NOT NULL,
      fee_amount REAL NOT NULL DEFAULT 0,
      capacity INTEGER NOT NULL DEFAULT 30
    );

    -- Student Transport Allocations
    CREATE TABLE IF NOT EXISTS student_transport (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id),
      route_id TEXT NOT NULL REFERENCES transport_routes(id),
      pickup_point TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    -- Hostels
    CREATE TABLE IF NOT EXISTS hostels (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      name TEXT NOT NULL,
      gender TEXT NOT NULL,
      warden_name TEXT NOT NULL,
      warden_phone TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 100
    );

    -- Hostel Allocations
    CREATE TABLE IF NOT EXISTS hostel_allocations (
      id TEXT PRIMARY KEY,
      hostel_id TEXT NOT NULL REFERENCES hostels(id),
      student_id TEXT NOT NULL REFERENCES students(id),
      room_number TEXT NOT NULL,
      bed_number TEXT NOT NULL,
      allocated_date DATE NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    -- Clinic Visits & Sickbay (Health Records - Restricted)
    CREATE TABLE IF NOT EXISTS clinic_visits (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      student_id TEXT NOT NULL REFERENCES students(id),
      visit_date DATE NOT NULL,
      complaint TEXT NOT NULL,
      diagnosis TEXT,
      treatment TEXT NOT NULL,
      attending_nurse TEXT NOT NULL,
      temperature_c REAL,
      parent_notified INTEGER NOT NULL DEFAULT 0,
      admitted_to_sickbay INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Counseling & Student Welfare Records (Restricted)
    CREATE TABLE IF NOT EXISTS counseling_sessions (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      student_id TEXT NOT NULL REFERENCES students(id),
      session_date DATE NOT NULL,
      session_topic TEXT NOT NULL,
      notes TEXT NOT NULL,
      counselor_name TEXT NOT NULL,
      action_plan TEXT,
      follow_up_required INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Inventory
    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      reorder_level INTEGER NOT NULL DEFAULT 10,
      unit_cost REAL NOT NULL DEFAULT 0,
      supplier_name TEXT
    );

    -- Announcements
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      target_audience TEXT NOT NULL DEFAULT 'All',
      published_by TEXT NOT NULL REFERENCES users(id),
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiry_date DATE
    );

    -- System Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function seedDemoDataIfEmpty() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count >= 20) return;

  // Temporarily disable foreign keys during seed execution
  db.pragma('foreign_keys = OFF');

  // Clean wipe to ensure deterministic seeding of all 20 roles and fixtures
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM counseling_sessions;
    DELETE FROM clinic_visits;
    DELETE FROM inventory_items;
    DELETE FROM hostel_allocations;
    DELETE FROM hostels;
    DELETE FROM student_transport;
    DELETE FROM transport_routes;
    DELETE FROM library_issues;
    DELETE FROM library_books;
    DELETE FROM expenses;
    DELETE FROM payments;
    DELETE FROM invoices;
    DELETE FROM fee_structures;
    DELETE FROM announcements;
    DELETE FROM marks;
    DELETE FROM assessments;
    DELETE FROM staff_leave;
    DELETE FROM staff_attendance;
    DELETE FROM staff;
    DELETE FROM student_guardians;
    DELETE FROM guardians;
    DELETE FROM attendance_records;
    DELETE FROM students;
    DELETE FROM users;
    DELETE FROM streams;
    DELETE FROM classes;
    DELETE FROM subjects;
    DELETE FROM terms;
    DELETE FROM academic_years;
    DELETE FROM schools;
  `);

  const schoolId = 'sch-mwanaweika-01';
  db.prepare(`
    INSERT INTO schools (id, name, code, motto, address, district, country, phone, email, currency, academic_year_active, term_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    schoolId,
    'Mwanaweika School',
    'MWK-256',
    'Knowledge, Discipline & Integrity',
    'Plot 14 Kyaggwe Road, P.O. Box 244, Mukono',
    'Mukono',
    'Uganda',
    '+256 701 458 920',
    'admin@mwanaweika.ac.ug',
    'UGX',
    '2026',
    'Term I'
  );

  // Academic Year 2026
  const yearId = 'ay-2026';
  db.prepare(`
    INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(yearId, schoolId, '2026', '2026-02-02', '2026-12-04');

  // Terms
  const terms = [
    { id: 'term-1-2026', name: 'Term I 2026', num: 1, start: '2026-02-02', end: '2026-05-01', active: 1 },
    { id: 'term-2-2026', name: 'Term II 2026', num: 2, start: '2026-05-25', end: '2026-08-21', active: 0 },
    { id: 'term-3-2026', name: 'Term III 2026', num: 3, start: '2026-09-14', end: '2026-12-04', active: 0 },
  ];
  const insertTerm = db.prepare(`
    INSERT INTO terms (id, academic_year_id, name, term_number, start_date, end_date, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  terms.forEach(t => insertTerm.run(t.id, yearId, t.name, t.num, t.start, t.end, t.active));

  // Classes: Primary 1 to Primary 7 + Senior 1 to Senior 4 (Ugandan Standard Structure)
  const classes = [
    { id: 'cls-p1', name: 'Primary One', code: 'P.1', level: 'Primary', order: 1 },
    { id: 'cls-p2', name: 'Primary Two', code: 'P.2', level: 'Primary', order: 2 },
    { id: 'cls-p3', name: 'Primary Three', code: 'P.3', level: 'Primary', order: 3 },
    { id: 'cls-p4', name: 'Primary Four', code: 'P.4', level: 'Primary', order: 4 },
    { id: 'cls-p5', name: 'Primary Five', code: 'P.5', level: 'Primary', order: 5 },
    { id: 'cls-p6', name: 'Primary Six', code: 'P.6', level: 'Primary', order: 6 },
    { id: 'cls-p7', name: 'Primary Seven', code: 'P.7', level: 'Primary', order: 7 },
    { id: 'cls-s1', name: 'Senior One', code: 'S.1', level: 'O-Level', order: 8 },
    { id: 'cls-s2', name: 'Senior Two', code: 'S.2', level: 'O-Level', order: 9 },
    { id: 'cls-s3', name: 'Senior Three', code: 'S.3', level: 'O-Level', order: 10 },
    { id: 'cls-s4', name: 'Senior Four', code: 'S.4', level: 'O-Level', order: 11 },
  ];
  const insertClass = db.prepare(`
    INSERT INTO classes (id, school_id, name, code, level, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  classes.forEach(c => insertClass.run(c.id, schoolId, c.name, c.code, c.level, c.order));

  // Streams (including S.3 Blue for Rebecca Akello and Brian Kato)
  const streams = [
    { id: 'str-p7-red', class_id: 'cls-p7', name: 'Cranes (Red)' },
    { id: 'str-p7-blue', class_id: 'cls-p7', name: 'Eagles (Blue)' },
    { id: 'str-s3-blue', class_id: 'cls-s3', name: 'S.3 Blue' },
    { id: 'str-s3-white', class_id: 'cls-s3', name: 'S.3 White' },
    { id: 'str-s1-a', class_id: 'cls-s1', name: 'Stream A' },
    { id: 'str-p6-a', class_id: 'cls-p6', name: 'Stream Alpha' },
  ];
  const insertStream = db.prepare('INSERT INTO streams (id, class_id, name, capacity, class_teacher_id) VALUES (?, ?, ?, 50, ?)');
  streams.forEach(s => insertStream.run(s.id, s.class_id, s.name, 'usr-teacher-class'));

  // Subjects
  const subjects = [
    { id: 'sb-math', code: 'MTC', name: 'Mathematics', cat: 'Core' },
    { id: 'sb-phy', code: 'PHY', name: 'Physics', cat: 'Core' },
    { id: 'sb-chem', code: 'CHM', name: 'Chemistry', cat: 'Core' },
    { id: 'sb-bio', code: 'BIO', name: 'Biology', cat: 'Core' },
    { id: 'sb-eng', code: 'ENG', name: 'English Language', cat: 'Core' },
    { id: 'sb-sci', code: 'SCI', name: 'Integrated Science', cat: 'Core' },
    { id: 'sb-sst', code: 'SST', name: 'Social Studies & R.E', cat: 'Core' },
    { id: 'sb-ict', code: 'ICT', name: 'Computer Studies & ICT', cat: 'Vocational' },
    { id: 'sb-art', code: 'ART', name: 'Art and Design', cat: 'Vocational' },
    { id: 'sb-lug', code: 'LUG', name: 'Luganda Language', cat: 'Optional' },
    { id: 'sb-agr', code: 'AGR', name: 'Agriculture', cat: 'Vocational' },
  ];
  const insertSub = db.prepare('INSERT INTO subjects (id, school_id, code, name, category) VALUES (?, ?, ?, ?, ?)');
  subjects.forEach(sb => insertSub.run(sb.id, schoolId, sb.code, sb.name, sb.cat));

  // Hash standard password for demo accounts
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Mwanaweika@2026', salt);

  // All 20 Roles Seeded with Precise Personas
  const all20Users = [
    // A. Leadership and Administration
    { id: 'usr-superadmin', username: 'superadmin', email: 'superadmin@mwanaweika.ac.ug', name: 'Platform Systems Admin', role: 'Super Administrator', phone: '+256 700 111 000', ctx: 'Platform Operations Center' },
    { id: 'usr-schooladmin', username: 'schooladmin', email: 'admin@mwanaweika.ac.ug', name: 'Eng. Ronald Ssekandi', role: 'School Administrator', phone: '+256 772 100 201', ctx: 'Mukono Campus Secretariat' },
    { id: 'usr-headteacher', username: 'headteacher', email: 'principal@mwanaweika.ac.ug', name: 'Dr. Phillip Mwanaweika', role: 'Head Teacher', phone: '+256 772 100 202', ctx: 'Principal Executive Office' },
    { id: 'usr-deputyhead', username: 'deputyhead', email: 'deputy@mwanaweika.ac.ug', name: 'Mr. Patrick Kibuuka', role: 'Deputy Head Teacher', phone: '+256 772 100 205', ctx: 'Academic & Operations Directorate' },
    { id: 'usr-director', username: 'director', email: 'director@mwanaweika.ac.ug', name: 'Hon. Beatrice Namugwanya', role: 'Director', phone: '+256 772 100 209', ctx: 'Board of Governors' },
    { id: 'usr-registrar', username: 'registrar', email: 'registrar@mwanaweika.ac.ug', name: 'Dr. Anthony Mwesigwa', role: 'Academic Registrar', phone: '+256 772 100 215', ctx: 'Examinations & Registry' },

    // B. Teaching
    { id: 'usr-teacher-class', username: 'class_teacher', email: 'r.akello@mwanaweika.ac.ug', name: 'Ms. Rebecca Akello', role: 'Class Teacher', phone: '+256 772 100 204', ctx: 'Class Teacher: S.3 Blue', assigned_class: 'cls-s3' },
    { id: 'usr-teacher-subj', username: 'subject_teacher', email: 'e.byamukama@mwanaweika.ac.ug', name: 'Mr. Emmanuel Byamukama', role: 'Subject Teacher', phone: '+256 772 100 212', ctx: 'Physics & Mathematics Teacher', assigned_sub: JSON.stringify(['sb-phy', 'sb-math']) },

    // C. Finance
    { id: 'usr-bursar', username: 'bursar', email: 'bursar@mwanaweika.ac.ug', name: 'CPA Grace Nakimera', role: 'Bursar', phone: '+256 772 100 203', ctx: 'Senior Bursar & Finance Head' },
    { id: 'usr-cashier', username: 'cashier', email: 'cashier@mwanaweika.ac.ug', name: 'Mr. Isaac Mukasa', role: 'Cashier', phone: '+256 772 100 218', ctx: 'Finance Office Counter Cashier' },

    // D. Admissions and Human Resources
    { id: 'usr-admissions', username: 'admissions', email: 'admissions@mwanaweika.ac.ug', name: 'Mrs. Stella Nalubega', role: 'Admissions Officer', phone: '+256 772 100 220', ctx: 'Admissions & Inquiries' },
    { id: 'usr-hr', username: 'hr_officer', email: 'hr@mwanaweika.ac.ug', name: 'Ms. Brenda Kyomugisha', role: 'Human Resource Officer', phone: '+256 772 100 222', ctx: 'Human Resources Directorate' },

    // E. Operations
    { id: 'usr-librarian', username: 'librarian', email: 'library@mwanaweika.ac.ug', name: 'Mr. Godfrey Ssenabulya', role: 'Librarian', phone: '+256 774 551 290', ctx: 'Main Library & Documentation' },
    { id: 'usr-transport', username: 'transport', email: 'transport@mwanaweika.ac.ug', name: 'Mr. Charles Walusimbi', role: 'Transport Officer', phone: '+256 782 334 112', ctx: 'Fleet & Bus Logistics' },
    { id: 'usr-storekeeper', username: 'storekeeper', email: 'store@mwanaweika.ac.ug', name: 'Mr. Joseph Ochieng', role: 'Storekeeper', phone: '+256 772 998 123', ctx: 'Central Inventory Store' },
    { id: 'usr-warden', username: 'warden', email: 'warden@mwanaweika.ac.ug', name: 'Mr. James Kasozi', role: 'Hostel Warden', phone: '+256 701 445 992', ctx: 'Boarding Facilities & Hostels' },

    // F. Health and Welfare
    { id: 'usr-nurse', username: 'school_nurse', email: 'nurse@mwanaweika.ac.ug', name: 'Nurse Juliet Nabirye', role: 'School Nurse', phone: '+256 702 334 556', ctx: 'School Clinic & Sickbay' },
    { id: 'usr-counselor', username: 'counselor', email: 'counselor@mwanaweika.ac.ug', name: 'Rev. Sister Florence Namutebi', role: 'Counselor', phone: '+256 703 112 233', ctx: 'Guidance & Counseling Department' },

    // G. Community Portals
    { id: 'usr-parent-sarah', username: 'parent_sarah', email: 'sarah.namubiru@gmail.com', name: 'Mrs. Sarah Namubiru', role: 'Parent', phone: '+256 703 892 114', ctx: 'Guardian: Brian Kato & Joshua Kigozi' },
    { id: 'usr-student-brian', username: 'student_brian', email: 'brian.kato@mwanaweika.ac.ug', name: 'Brian Kato', role: 'Student', phone: '+256 700 000 005', ctx: 'Learner: S.3 Blue (Adm: MWK/2026/0146)' }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, school_id, username, email, password_hash, full_name, role, phone, assigned_context, assigned_class_id, assigned_subjects)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of all20Users) {
    insertUser.run(
      u.id,
      schoolId,
      u.username,
      u.email,
      passwordHash,
      u.name,
      u.role,
      u.phone,
      u.ctx || null,
      (u as any).assigned_class || null,
      (u as any).assigned_sub || null
    );
  }

  // Staff registry
  const staffMembers = [
    { id: 'stf-head', uid: 'usr-headteacher', num: 'STF/MWK/001', fn: 'Phillip', ln: 'Mwanaweika', des: 'Head Teacher / Principal', dep: 'Executive Administration', ph: '+256 772 100 202', em: 'principal@mwanaweika.ac.ug' },
    { id: 'stf-deputy', uid: 'usr-deputyhead', num: 'STF/MWK/002', fn: 'Patrick', ln: 'Kibuuka', des: 'Deputy Head Teacher', dep: 'Academics & Operations', ph: '+256 772 100 205', em: 'deputy@mwanaweika.ac.ug' },
    { id: 'stf-bursar', uid: 'usr-bursar', num: 'STF/MWK/003', fn: 'Grace', ln: 'Nakimera', des: 'Senior Bursar (CPA)', dep: 'Accounts & Finance', ph: '+256 772 100 203', em: 'bursar@mwanaweika.ac.ug' },
    { id: 'stf-teacher-akello', uid: 'usr-teacher-class', num: 'STF/MWK/004', fn: 'Rebecca', ln: 'Akello', des: 'Class Teacher S.3 Blue', dep: 'Academics', ph: '+256 772 100 204', em: 'r.akello@mwanaweika.ac.ug' },
    { id: 'stf-teacher-byamukama', uid: 'usr-teacher-subj', num: 'STF/MWK/005', fn: 'Emmanuel', ln: 'Byamukama', des: 'Head of Physics & Mathematics', dep: 'Sciences Department', ph: '+256 772 100 212', em: 'e.byamukama@mwanaweika.ac.ug' },
    { id: 'stf-cashier', uid: 'usr-cashier', num: 'STF/MWK/006', fn: 'Isaac', ln: 'Mukasa', des: 'Counter Cashier', dep: 'Accounts & Finance', ph: '+256 772 100 218', em: 'cashier@mwanaweika.ac.ug' },
    { id: 'stf-admissions', uid: 'usr-admissions', num: 'STF/MWK/007', fn: 'Stella', ln: 'Nalubega', des: 'Admissions & Inquiries Officer', dep: 'Admissions', ph: '+256 772 100 220', em: 'admissions@mwanaweika.ac.ug' },
    { id: 'stf-hr', uid: 'usr-hr', num: 'STF/MWK/008', fn: 'Brenda', ln: 'Kyomugisha', des: 'Human Resources Manager', dep: 'Human Resources', ph: '+256 772 100 222', em: 'hr@mwanaweika.ac.ug' },
    { id: 'stf-librarian', uid: 'usr-librarian', num: 'STF/MWK/009', fn: 'Godfrey', ln: 'Ssenabulya', des: 'Senior Librarian', dep: 'Library', ph: '+256 774 551 290', em: 'library@mwanaweika.ac.ug' },
    { id: 'stf-transport', uid: 'usr-transport', num: 'STF/MWK/010', fn: 'Charles', ln: 'Walusimbi', des: 'Transport Logistics Officer', dep: 'Operations & Fleet', ph: '+256 782 334 112', em: 'transport@mwanaweika.ac.ug' },
    { id: 'stf-store', uid: 'usr-storekeeper', num: 'STF/MWK/011', fn: 'Joseph', ln: 'Ochieng', des: 'Central Storekeeper', dep: 'Store & Procurement', ph: '+256 772 998 123', em: 'store@mwanaweika.ac.ug' },
    { id: 'stf-warden', uid: 'usr-warden', num: 'STF/MWK/012', fn: 'James', ln: 'Kasozi', des: 'Senior Hostel Warden', dep: 'Boarding Facilities', ph: '+256 701 445 992', em: 'warden@mwanaweika.ac.ug' },
    { id: 'stf-nurse', uid: 'usr-nurse', num: 'STF/MWK/013', fn: 'Juliet', ln: 'Nabirye', des: 'Senior Nursing Officer', dep: 'Health & Sickbay', ph: '+256 702 334 556', em: 'nurse@mwanaweika.ac.ug' },
    { id: 'stf-counselor', uid: 'usr-counselor', num: 'STF/MWK/014', fn: 'Florence', ln: 'Namutebi', des: 'Lead Student Counselor', dep: 'Guidance & Welfare', ph: '+256 703 112 233', em: 'counselor@mwanaweika.ac.ug' },
    { id: 'stf-registrar', uid: 'usr-registrar', num: 'STF/MWK/015', fn: 'Anthony', ln: 'Mwesigwa', des: 'Academic Registrar', dep: 'Academics & Registry', ph: '+256 772 100 215', em: 'registrar@mwanaweika.ac.ug' }
  ];

  const insertStaff = db.prepare(`
    INSERT INTO staff (id, school_id, user_id, staff_number, first_name, last_name, designation, department, phone, email, qualification, employment_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'B.Ed / Dip / Post-Graduate', '2021-01-10')
  `);
  staffMembers.forEach(s => insertStaff.run(s.id, schoolId, s.uid, s.num, s.fn, s.ln, s.des, s.dep, s.ph, s.em));

  // Staff Attendance sample records
  const today = new Date().toISOString().split('T')[0];
  const insertStaffAtt = db.prepare(`
    INSERT INTO staff_attendance (id, staff_id, date, clock_in, clock_out, status, notes, marked_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'usr-hr')
  `);
  staffMembers.slice(0, 10).forEach((s, idx) => {
    insertStaffAtt.run(`sa-${idx}`, s.id, today, '07:45:00', '16:30:00', 'Present', 'On regular instructional duty');
  });

  // Guardian: Mrs. Sarah Namubiru (Parent of Brian Kato & Joshua Kigozi)
  const guardianId = 'grd-sarah';
  db.prepare(`
    INSERT INTO guardians (id, school_id, user_id, full_name, relationship, phone, alt_phone, email, physical_address, national_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(guardianId, schoolId, 'usr-parent-sarah', 'Mrs. Sarah Namubiru', 'Mother', '+256 703 892 114', '+256 772 888 123', 'sarah.namubiru@gmail.com', 'Namilyango Road, Mukono Municipality', 'CM89201984210L');

  // Students: Brian Kato (S.3 Blue) and Joshua Kigozi (P.7 Cranes)
  const students = [
    { id: 'std-brian', adm: 'MWK/2026/0146', lin: 'LIN-UG-2026-9905', fn: 'Brian', mn: 'Kato', ln: 'Mubiru', gen: 'Male', dob: '2010-04-12', cls: 'cls-s3', str: 'str-s3-blue', bs: 'Boarder', med: 'No known allergies.' },
    { id: 'std-joshua', adm: 'MWK/2026/0142', lin: 'LIN-UG-2026-9901', fn: 'Joshua', mn: 'Kigozi', ln: 'Mukasa', gen: 'Male', dob: '2013-05-14', cls: 'cls-p7', str: 'str-p7-red', bs: 'Boarder', med: 'Asthmatic inhaler kept with sickbay nurse for dust sensitivity.' },
    { id: 'std-patricia', adm: 'MWK/2026/0143', lin: 'LIN-UG-2026-9902', fn: 'Patricia', mn: 'Babirye', ln: 'Nansubuga', gen: 'Female', dob: '2014-08-20', cls: 'cls-p7', str: 'str-p7-red', bs: 'Day', med: 'Allergic to penicillin.' },
    { id: 'std-arnold', adm: 'MWK/2026/0144', lin: 'LIN-UG-2026-9903', fn: 'Arnold', mn: 'Ssali', ln: 'Kivumbi', gen: 'Male', dob: '2013-11-02', cls: 'cls-p7', str: 'str-p7-blue', bs: 'Boarder', med: 'None' },
    { id: 'std-daphne', adm: 'MWK/2026/0145', lin: 'LIN-UG-2026-9904', fn: 'Daphne', mn: 'Maria', ln: 'Namusoke', gen: 'Female', dob: '2014-03-12', cls: 'cls-p6', str: 'str-p6-a', bs: 'Day', med: 'None' },
    { id: 'std-kevin', adm: 'MWK/2026/0147', lin: 'LIN-UG-2026-9906', fn: 'Kevin', mn: 'Joseph', ln: 'Wasswa', gen: 'Male', dob: '2010-09-18', cls: 'cls-s3', str: 'str-s3-blue', bs: 'Day', med: 'None' }
  ];

  const insertStd = db.prepare(`
    INSERT INTO students (id, school_id, admission_number, lin, first_name, middle_name, last_name, gender, dob, enrollment_date, class_id, stream_id, boarding_status, medical_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '2026-02-02', ?, ?, ?, ?)
  `);
  students.forEach(st => insertStd.run(st.id, schoolId, st.adm, st.lin, st.fn, st.mn, st.ln, st.gen, st.dob, st.cls, st.str, st.bs, st.med));

  // Link Sarah to both Brian Kato and Joshua Kigozi (Multi-Child Parent Portal)
  db.prepare('INSERT INTO student_guardians (id, student_id, guardian_id, is_primary) VALUES (?, ?, ?, 1)').run('sg-01', 'std-brian', guardianId);
  db.prepare('INSERT INTO student_guardians (id, student_id, guardian_id, is_primary) VALUES (?, ?, ?, 1)').run('sg-02', 'std-joshua', guardianId);

  // Fee structures
  const feeStructures = [
    { id: 'fee-s3-board', cls: 'cls-s3', cat: 'Tuition & Science Practical Fees', bs: 'Boarder', amt: 1400000 },
    { id: 'fee-s3-day', cls: 'cls-s3', cat: 'Tuition & Lunch Fees', bs: 'Day', amt: 750000 },
    { id: 'fee-p7-board', cls: 'cls-p7', cat: 'Tuition & Boarding Fee', bs: 'Boarder', amt: 1250000 },
    { id: 'fee-p7-day', cls: 'cls-p7', cat: 'Tuition & Development', bs: 'Day', amt: 650000 },
  ];
  const insertFee = db.prepare(`
    INSERT INTO fee_structures (id, school_id, academic_year_id, term_id, class_id, category, boarding_status, amount)
    VALUES (?, ?, ?, 'term-1-2026', ?, ?, ?, ?)
  `);
  feeStructures.forEach(f => insertFee.run(f.id, schoolId, yearId, f.cls, f.cat, f.bs, f.amt));

  // Invoices & Payments
  // Brian Kato: UGX 1,400,000 Total, Paid UGX 900,000, Balance UGX 500,000
  db.prepare(`
    INSERT INTO invoices (id, school_id, student_id, invoice_number, term_id, academic_year_id, total_amount, payable_amount, balance, due_date, status)
    VALUES ('inv-brian', ?, 'std-brian', 'INV/2026/00146', 'term-1-2026', ?, 1400000, 1400000, 500000, '2026-03-31', 'Partially Paid')
  `).run(schoolId, yearId);

  db.prepare(`
    INSERT INTO payments (id, invoice_id, student_id, receipt_number, amount, payment_method, reference_code, notes, received_by)
    VALUES ('pay-brian-1', 'inv-brian', 'std-brian', 'RCT-MWK-2026-091', 900000, 'MTN Mobile Money', 'MM-UG-991204', 'Term I Boarding Fees paid by Mrs. Sarah Namubiru', 'usr-cashier')
  `).run();

  // Joshua Kigozi: UGX 1,250,000 Total, Paid UGX 850,000, Balance UGX 400,000
  db.prepare(`
    INSERT INTO invoices (id, school_id, student_id, invoice_number, term_id, academic_year_id, total_amount, payable_amount, balance, due_date, status)
    VALUES ('inv-joshua', ?, 'std-joshua', 'INV/2026/00142', 'term-1-2026', ?, 1250000, 1250000, 400000, '2026-03-31', 'Partially Paid')
  `).run(schoolId, yearId);

  db.prepare(`
    INSERT INTO payments (id, invoice_id, student_id, receipt_number, amount, payment_method, reference_code, notes, received_by)
    VALUES ('pay-joshua-1', 'inv-joshua', 'std-joshua', 'RCT-MWK-2026-092', 850000, 'Stanbic Bank', 'SB-UG-44120', 'Bank deposit by Mrs. Sarah Namubiru', 'usr-cashier')
  `).run();

  // Assessments
  const asm1 = 'asm-mot-2026';
  db.prepare(`
    INSERT INTO assessments (id, school_id, term_id, name, type, academic_year_id)
    VALUES (?, ?, 'term-1-2026', 'Mid-Term Examinations 2026', 'Exam', ?)
  `).run(asm1, schoolId, yearId);

  // Marks for Brian Kato (S.3 Blue) - Physics & Mathematics taught by Emmanuel Byamukama
  const brianMarks = [
    { sub: 'sb-phy', score: 88, grade: 'D1', desc: 'Outstanding experimental physics and mechanics understanding.', comment: 'Exemplary practical laboratory deductions.' },
    { sub: 'sb-math', score: 92, grade: 'D1', desc: 'Mastery in quadratic equations, geometry and statistics.', comment: 'Excellent problem solving; recommended for National Math Olympiad.' },
    { sub: 'sb-chem', score: 79, grade: 'D2', desc: 'Proficient in volumetric analysis and periodic classifications.', comment: 'Consistent performance.' },
    { sub: 'sb-bio', score: 84, grade: 'D1', desc: 'High aptitude in genetics and cellular structures.', comment: 'Active and enthusiastic in class.' },
    { sub: 'sb-eng', score: 76, grade: 'D2', desc: 'Good narrative and argumentative composition writing.', comment: 'Continue refining comprehension vocabulary.' }
  ];

  const insertMark = db.prepare(`
    INSERT INTO marks (id, assessment_id, student_id, subject_id, class_id, score, max_score, grade, descriptor, teacher_comment, entered_by, approved)
    VALUES (?, ?, 'std-brian', ?, 'cls-s3', ?, 100, ?, ?, ?, 'usr-teacher-subj', 1)
  `);
  brianMarks.forEach((m, idx) => insertMark.run(`mrk-brian-${idx}`, asm1, m.sub, m.score, m.grade, m.desc, m.comment));

  // Attendance Records for S.3 Blue (managed by Rebecca Akello)
  const insertAtt = db.prepare(`
    INSERT OR REPLACE INTO attendance_records (id, student_id, class_id, stream_id, date, session, status, reason, marked_by)
    VALUES (?, ?, ?, ?, ?, 'Morning', ?, ?, 'usr-teacher-class')
  `);
  insertAtt.run('att-s3-1', 'std-brian', 'cls-s3', 'str-s3-blue', today, 'Present', null);
  insertAtt.run('att-s3-2', 'std-kevin', 'cls-s3', 'str-s3-blue', today, 'Late', 'Heavy rain delay at Seeta Stage');

  // Timetable
  const insertTt = db.prepare(`
    INSERT INTO timetable_slots (id, class_id, stream_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTt.run('tt-s3-1', 'cls-s3', 'str-s3-blue', 'sb-phy', 'stf-teacher-byamukama', 'Monday', '08:00', '09:20', 'Physics Lab S.3');
  insertTt.run('tt-s3-2', 'cls-s3', 'str-s3-blue', 'sb-math', 'stf-teacher-byamukama', 'Monday', '09:20', '10:40', 'S.3 Blue Room');
  insertTt.run('tt-s3-3', 'cls-s3', 'str-s3-blue', 'sb-chem', 'stf-teacher-akello', 'Tuesday', '08:00', '09:20', 'Chemistry Lab');

  // Library
  const insertBk = db.prepare(`
    INSERT INTO library_books (id, school_id, title, author, isbn, category, total_copies, available_copies, shelf_location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertBk.run('bk-01', schoolId, 'Ordinary Level Physics (Abbott)', 'A.F. Abbott', '978-0435670108', 'Physics', 40, 36, 'Shelf P-01');
  insertBk.run('bk-02', schoolId, 'Pure Mathematics for Advanced Students', 'Backhouse', '978-0582353862', 'Mathematics', 35, 31, 'Shelf M-03');
  insertBk.run('bk-03', schoolId, 'Comprehensive Secondary Biology for Uganda', 'Fountain', '978-9970-25-331-8', 'Biology', 50, 48, 'Shelf B-02');

  // Transport
  db.prepare(`
    INSERT INTO transport_routes (id, school_id, route_name, pickup_points, vehicle_reg, driver_name, driver_phone, fee_amount, capacity)
    VALUES ('rt-01', ?, 'Route 1: Seeta - Wantoni - Mukono Town', 'Seeta Town, Wantoni Stage, Mukono Cathedral, School Gate', 'UAZ 418K (Toyota Coaster)', 'Mr. Paul Mukasa', '+256 702 441 990', 250000, 32)
  `).run(schoolId);

  // Hostels
  db.prepare(`
    INSERT INTO hostels (id, school_id, name, gender, warden_name, warden_phone, capacity)
    VALUES ('hst-01', ?, 'Kabaka Daudi Chwa Hostel (Boys Dormitory)', 'Boys', 'Mr. James Kasozi', '+256 701 445 992', 120)
  `).run(schoolId);

  db.prepare(`
    INSERT INTO hostel_allocations (id, hostel_id, student_id, room_number, bed_number, allocated_date, active)
    VALUES ('ha-brian', 'hst-01', 'std-brian', 'Block C - Room 2', 'Bed C2-Lower', '2026-02-02', 1)
  `).run();

  // Clinic Visits (Health Records - Nurse Juliet Nabirye)
  const insertClinic = db.prepare(`
    INSERT INTO clinic_visits (id, school_id, student_id, visit_date, complaint, diagnosis, treatment, attending_nurse, temperature_c, parent_notified, admitted_to_sickbay)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertClinic.run(
    'cln-01',
    schoolId,
    'std-joshua',
    today,
    'Mild wheezing after physical education games on the dusty pitch',
    'Dust-induced bronchospasm',
    'Administered Salbutamol 2 puffs via spacer; rested 45 mins at sickbay',
    'Nurse Juliet Nabirye',
    36.6,
    1,
    0
  );
  insertClinic.run(
    'cln-02',
    schoolId,
    'std-patricia',
    '2026-02-20',
    'Tension headache and fatigue',
    'Dehydration & mild fatigue',
    'Oral rehydration salts (ORS), Paracetamol 500mg, rested at observation cot',
    'Nurse Juliet Nabirye',
    36.8,
    0,
    0
  );

  // Counseling Records (Rev. Sister Florence Namutebi)
  const insertCounsel = db.prepare(`
    INSERT INTO counseling_sessions (id, school_id, student_id, session_date, session_topic, notes, counselor_name, action_plan, follow_up_required)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertCounsel.run(
    'cns-01',
    schoolId,
    'std-brian',
    '2026-02-15',
    'Academic focus & time management for O-Level sciences',
    'Brian expressed strong enthusiasm for engineering but feels anxious balancing Physics practicals with extracurricular debate. He is bright, composed and articulate.',
    'Rev. Sister Florence Namutebi',
    'Established an evening prep timetable allocating 1 hr to Physics revision and 1 hr to Math exercises.',
    1
  );

  // Store Inventory (Joseph Ochieng)
  const insertInv = db.prepare(`
    INSERT INTO inventory_items (id, school_id, name, category, unit, quantity, reorder_level, unit_cost, supplier_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertInv.run('inv-01', schoolId, 'A4 Duplicating Paper (80gsm)', 'Stationery', 'Reams', 75, 20, 24000, 'Mukono Bookshop Ltd');
  insertInv.run('inv-02', schoolId, 'Laboratory Glass Beakers 250ml', 'Lab Equipment', 'Pieces', 60, 15, 12000, 'Naluvule Scientific Supplies');
  insertInv.run('inv-03', schoolId, 'Posho Maize Flour (Grade 1)', 'Food & Provisions', 'Bags (100kg)', 35, 10, 220000, 'Kyaggwe Farmers Cooperative');

  // Announcements
  db.prepare(`
    INSERT INTO announcements (id, school_id, title, content, target_audience, published_by, expiry_date)
    VALUES ('ann-01', ?, 'Term I 2026 Consultative Parents-Teachers Conference', 'We invite all parents to our consultative conference on Saturday 28th March 2026 in the Main Hall.', 'Parents', ?, '2026-03-29')
  `).run(schoolId, 'usr-headteacher');

  // Audit Logs
  db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, module, details, ip_address)
    VALUES ('log-init', 'usr-superadmin', 'SYSTEM_INITIALIZATION', 'Core', 'Mwanaweika School Management System provisioned with full 20 authorized roles and strict access policies.', '127.0.0.1')
  `).run();

  // Re-enable foreign keys
  db.pragma('foreign_keys = ON');
}
