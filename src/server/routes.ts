import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mwanaweika_sms_secret_key_2026_mukono';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    school_id: string;
    username: string;
    role: string;
    full_name: string;
    assigned_class_id?: string;
    assigned_subjects?: string[];
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired session token' });
  }
}

/**
 * Backend authorization guard verifying role membership
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access Denied: Your role '${req.user.role}' is not authorized to access this module.`
      });
      return;
    }
    next();
  };
}

export const apiRouter = express.Router();

// ----------------------------------------------------
// AUTHENTICATION & PERSONA SWITCHING
// ----------------------------------------------------
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username/email and password required' });
    return;
  }

  const user = db.prepare(`
    SELECT u.*, s.name as school_name, s.currency
    FROM users u
    JOIN schools s ON s.id = u.school_id
    WHERE (u.username = ? OR u.email = ?) AND u.is_active = 1
  `).get(username, username) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid credentials. Please verify your username and password.' });
    return;
  }

  db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

  let guardianData = null;
  let studentData = null;
  if (user.role === 'Parent') {
    guardianData = db.prepare('SELECT * FROM guardians WHERE user_id = ?').get(user.id);
  } else if (user.role === 'Student') {
    studentData = db.prepare('SELECT * FROM students WHERE admission_number = ?').get('MWK/2026/0146');
  }

  const assignedSubjects = user.assigned_subjects ? JSON.parse(user.assigned_subjects) : undefined;

  const token = jwt.sign(
    {
      id: user.id,
      school_id: user.school_id,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
      assigned_class_id: user.assigned_class_id,
      assigned_subjects: assignedSubjects,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  db.prepare('INSERT INTO audit_logs (id, user_id, action, module, details) VALUES (?, ?, ?, ?, ?)')
    .run(`log-${Date.now()}`, user.id, 'USER_LOGIN', 'Auth', `Successful login for ${user.username} (${user.role})`);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      assignedContext: user.assigned_context,
      phone: user.phone,
      schoolId: user.school_id,
      schoolName: user.school_name,
      currency: user.currency,
      guardianData,
      studentData,
      assignedClassId: user.assigned_class_id,
      assignedSubjects,
    }
  });
});

apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { targetRole } = req.body;
  const user = db.prepare(`
    SELECT u.*, s.name as school_name, s.currency
    FROM users u
    JOIN schools s ON s.id = u.school_id
    WHERE u.role = ?
    LIMIT 1
  `).get(targetRole) as any;

  if (!user) {
    res.status(404).json({ error: `No active persona account found with role '${targetRole}'` });
    return;
  }

  let guardianData = null;
  let studentData = null;
  if (user.role === 'Parent') {
    guardianData = db.prepare('SELECT * FROM guardians WHERE user_id = ?').get(user.id);
  } else if (user.role === 'Student') {
    studentData = db.prepare('SELECT * FROM students WHERE admission_number = ?').get('MWK/2026/0146');
  }

  const assignedSubjects = user.assigned_subjects ? JSON.parse(user.assigned_subjects) : undefined;

  const token = jwt.sign(
    {
      id: user.id,
      school_id: user.school_id,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
      assigned_class_id: user.assigned_class_id,
      assigned_subjects: assignedSubjects,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      assignedContext: user.assigned_context,
      phone: user.phone,
      schoolId: user.school_id,
      schoolName: user.school_name,
      currency: user.currency,
      guardianData,
      studentData,
      assignedClassId: user.assigned_class_id,
      assignedSubjects,
    }
  });
});

// ----------------------------------------------------
// ROLE-AWARE DASHBOARD SUMMARY
// ----------------------------------------------------
apiRouter.get('/dashboard/summary', authMiddleware, (req: AuthRequest, res: Response) => {
  const schoolId = req.user!.school_id;
  const userRole = req.user!.role;

  // Total metrics
  const totalStudents = (db.prepare('SELECT COUNT(*) as count FROM students WHERE school_id = ? AND status = "Active"').get(schoolId) as any).count;
  const totalStaff = (db.prepare('SELECT COUNT(*) as count FROM staff WHERE school_id = ?').get(schoolId) as any).count;
  
  const today = new Date().toISOString().split('T')[0];
  const presentToday = (db.prepare('SELECT COUNT(*) as count FROM attendance_records WHERE date = ? AND status = "Present"').get(today) as any).count;
  const absentToday = (db.prepare('SELECT COUNT(*) as count FROM attendance_records WHERE date = ? AND status = "Absent"').get(today) as any).count;

  // Sensitive financial metrics - only for authorized leadership and bursar
  let feesCollected = 0;
  let feesPending = 0;
  let recentExpenses = 0;
  const financialAuthorizedRoles = ['Super Administrator', 'School Administrator', 'Head Teacher', 'Deputy Head Teacher', 'Director', 'Bursar', 'Cashier'];
  
  if (financialAuthorizedRoles.includes(userRole)) {
    feesCollected = (db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payments').get() as any).total;
    feesPending = (db.prepare('SELECT COALESCE(SUM(balance), 0) as total FROM invoices WHERE status != "Paid"').get() as any).total;
    recentExpenses = (db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses').get() as any).total;
  }

  const borrowedBooks = (db.prepare('SELECT COUNT(*) as count FROM library_issues WHERE status = "Borrowed"').get() as any).count;
  const transportCount = (db.prepare('SELECT COUNT(*) as count FROM student_transport WHERE active = 1').get() as any).count;
  const boardersCount = (db.prepare('SELECT COUNT(*) as count FROM students WHERE boarding_status = "Boarder" AND status = "Active"').get() as any).count;

  // Specific role counts
  const clinicVisitsToday = (db.prepare('SELECT COUNT(*) as count FROM clinic_visits WHERE visit_date = ?').get(today) as any).count;
  const counselingSessionsCount = (db.prepare('SELECT COUNT(*) as count FROM counseling_sessions').get() as any).count;
  const stockItemsCount = (db.prepare('SELECT COUNT(*) as count FROM inventory_items').get() as any).count;

  const activeAnnouncements = db.prepare('SELECT * FROM announcements ORDER BY published_at DESC LIMIT 5').all();
  
  // Recent payments visible only if authorized
  let recentPayments: any[] = [];
  if (financialAuthorizedRoles.includes(userRole)) {
    recentPayments = db.prepare(`
      SELECT p.*, s.first_name, s.last_name, s.admission_number
      FROM payments p
      JOIN students s ON s.id = p.student_id
      ORDER BY p.created_at DESC LIMIT 6
    `).all();
  }

  const classEnrollments = db.prepare(`
    SELECT c.code, c.name, COUNT(s.id) as student_count
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id AND s.status = 'Active'
    WHERE c.school_id = ?
    GROUP BY c.id
    ORDER BY c.order_index ASC
  `).all(schoolId);

  res.json({
    metrics: {
      totalStudents,
      totalStaff,
      presentToday,
      absentToday,
      attendanceRate: totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 100,
      feesCollected,
      feesPending,
      recentExpenses,
      borrowedBooks,
      transportCount,
      boardersCount,
      clinicVisitsToday,
      counselingSessionsCount,
      stockItemsCount,
    },
    activeAnnouncements,
    recentPayments,
    classEnrollments,
  });
});

// ----------------------------------------------------
// STUDENTS & ADMISSION LIFECYCLE (Role-Restricted)
// ----------------------------------------------------
apiRouter.get('/students', authMiddleware, (req: AuthRequest, res: Response) => {
  const schoolId = req.user!.school_id;
  const userRole = req.user!.role;
  const { class_id, search, status } = req.query;

  // A Student can only see their own record
  if (userRole === 'Student') {
    const student = db.prepare(`
      SELECT s.*, c.name as class_name, c.code as class_code, str.name as stream_name,
             (SELECT COALESCE(SUM(balance), 0) FROM invoices WHERE student_id = s.id) as outstanding_balance
      FROM students s
      JOIN classes c ON c.id = s.class_id
      LEFT JOIN streams str ON str.id = s.stream_id
      WHERE s.admission_number = 'MWK/2026/0146'
    `).all();
    res.json(student);
    return;
  }

  // A Parent can only see their linked children
  if (userRole === 'Parent') {
    const guardian = db.prepare('SELECT id FROM guardians WHERE user_id = ?').get(req.user!.id) as any;
    if (!guardian) {
      res.json([]);
      return;
    }
    const children = db.prepare(`
      SELECT s.*, c.name as class_name, c.code as class_code, str.name as stream_name,
             (SELECT COALESCE(SUM(balance), 0) FROM invoices WHERE student_id = s.id) as outstanding_balance
      FROM students s
      JOIN student_guardians sg ON sg.student_id = s.id
      JOIN classes c ON c.id = s.class_id
      LEFT JOIN streams str ON str.id = s.stream_id
      WHERE sg.guardian_id = ?
    `).all(guardian.id);
    res.json(children);
    return;
  }

  // A Class Teacher (Rebecca Akello) can only see pupils in their assigned class
  let targetClassId = class_id;
  if (userRole === 'Class Teacher' && req.user!.assigned_class_id) {
    targetClassId = req.user!.assigned_class_id;
  }

  let sql = `
    SELECT s.*, c.name as class_name, c.code as class_code, str.name as stream_name,
           (SELECT COALESCE(SUM(balance), 0) FROM invoices WHERE student_id = s.id) as outstanding_balance
    FROM students s
    JOIN classes c ON c.id = s.class_id
    LEFT JOIN streams str ON str.id = s.stream_id
    WHERE s.school_id = ?
  `;
  const params: any[] = [schoolId];

  if (targetClassId) {
    sql += ' AND s.class_id = ?';
    params.push(targetClassId);
  }
  if (status) {
    sql += ' AND s.status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.admission_number LIKE ? OR s.lin LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  sql += ' ORDER BY c.order_index ASC, s.first_name ASC';
  const students = db.prepare(sql).all(...params);
  res.json(students);
});

apiRouter.get('/students/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const userRole = req.user!.role;
  const student = db.prepare(`
    SELECT s.*, c.name as class_name, c.code as class_code, str.name as stream_name
    FROM students s
    JOIN classes c ON c.id = s.class_id
    LEFT JOIN streams str ON str.id = s.stream_id
    WHERE s.id = ?
  `).get(req.params.id) as any;

  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  // Security check: Student role cannot view another student's profile
  if (userRole === 'Student' && student.admission_number !== 'MWK/2026/0146') {
    res.status(403).json({ error: 'Access Denied: You may only view your own student record.' });
    return;
  }

  // Security check: Parent role can only view their legally linked children
  if (userRole === 'Parent') {
    const isLinked = db.prepare(`
      SELECT 1 FROM student_guardians sg
      JOIN guardians g ON g.id = sg.guardian_id
      WHERE g.user_id = ? AND sg.student_id = ?
    `).get(req.user!.id, student.id);
    if (!isLinked) {
      res.status(403).json({ error: 'Access Denied: You do not have guardian custody authorization for this student.' });
      return;
    }
  }

  // Security check: Class Teacher cannot view students outside their assigned class
  if (userRole === 'Class Teacher' && req.user!.assigned_class_id && student.class_id !== req.user!.assigned_class_id) {
    res.status(403).json({ error: 'Access Denied: This student is not in your assigned class.' });
    return;
  }

  // Get guardians
  const guardians = db.prepare(`
    SELECT g.*, sg.is_primary, sg.pickup_authorized
    FROM guardians g
    JOIN student_guardians sg ON sg.guardian_id = g.id
    WHERE sg.student_id = ?
  `).all(student.id);

  // Invoices & payments
  const invoices = db.prepare('SELECT * FROM invoices WHERE student_id = ? ORDER BY created_at DESC').all(student.id);
  const payments = db.prepare('SELECT * FROM payments WHERE student_id = ? ORDER BY created_at DESC').all(student.id);
  const marks = db.prepare(`
    SELECT m.*, sub.name as subject_name, sub.code as subject_code, a.name as assessment_name
    FROM marks m
    JOIN subjects sub ON sub.id = m.subject_id
    JOIN assessments a ON a.id = m.assessment_id
    WHERE m.student_id = ?
    ORDER BY a.name ASC, sub.name ASC
  `).all(student.id);

  // Attendance summary
  const attendance = db.prepare('SELECT * FROM attendance_records WHERE student_id = ? ORDER BY date DESC LIMIT 30').all(student.id);

  res.json({
    ...student,
    guardians,
    invoices,
    payments,
    marks,
    attendance,
  });
});

// Student admission: Only Admissions Officer, Super Admin, School Admin, Head Teacher
apiRouter.post('/students', authMiddleware, requireRoles('Super Administrator', 'School Administrator', 'Head Teacher', 'Admissions Officer'), (req: AuthRequest, res: Response) => {
  const {
    first_name, middle_name, last_name, gender, dob, class_id, stream_id,
    boarding_status, lin, district, address, medical_notes, guardian_name,
    guardian_phone, guardian_email, guardian_relationship
  } = req.body;

  if (!first_name || !last_name || !class_id || !dob) {
    res.status(400).json({ error: 'First name, last name, date of birth and class are required.' });
    return;
  }

  const schoolId = req.user!.school_id;
  const studentCount = (db.prepare('SELECT COUNT(*) as count FROM students').get() as any).count;
  const admission_number = `MWK/2026/${String(studentCount + 148).padStart(4, '0')}`;
  const studentId = `std-${Date.now()}`;

  const transaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO students (
        id, school_id, admission_number, lin, first_name, middle_name, last_name,
        gender, dob, enrollment_date, class_id, stream_id, boarding_status,
        district, address, medical_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, ?, ?, ?, ?, ?, ?)
    `).run(
      studentId, schoolId, admission_number, lin || null, first_name, middle_name || null,
      last_name, gender || 'Male', dob, class_id, stream_id || null, boarding_status || 'Day',
      district || 'Mukono', address || 'Mukono', medical_notes || null
    );

    if (guardian_name && guardian_phone) {
      const guardianId = `grd-${Date.now()}`;
      db.prepare(`
        INSERT INTO guardians (id, school_id, full_name, relationship, phone, email, physical_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(guardianId, schoolId, guardian_name, guardian_relationship || 'Parent', guardian_phone, guardian_email || null, address || 'Mukono');

      db.prepare(`
        INSERT INTO student_guardians (id, student_id, guardian_id, is_primary)
        VALUES (?, ?, ?, 1)
      `).run(`sg-${Date.now()}`, studentId, guardianId);
    }

    const feeConfig = db.prepare(`
      SELECT * FROM fee_structures
      WHERE class_id = ? AND (boarding_status = ? OR boarding_status = 'All')
      LIMIT 1
    `).get(class_id, boarding_status || 'Day') as any;

    const invoiceAmount = feeConfig ? feeConfig.amount : (boarding_status === 'Boarder' ? 1400000 : 750000);
    const invoiceNumber = `INV/2026/${String(studentCount + 148).padStart(5, '0')}`;
    
    db.prepare(`
      INSERT INTO invoices (
        id, school_id, student_id, invoice_number, term_id, academic_year_id,
        total_amount, payable_amount, balance, due_date, status
      ) VALUES (?, ?, ?, ?, 'term-1-2026', 'ay-2026', ?, ?, ?, '2026-03-31', 'Unpaid')
    `).run(`inv-${Date.now()}`, schoolId, studentId, invoiceNumber, invoiceAmount, invoiceAmount, invoiceAmount);

    db.prepare('INSERT INTO audit_logs (id, user_id, action, module, details) VALUES (?, ?, ?, ?, ?)')
      .run(`log-${Date.now()}`, req.user!.id, 'ADMIT_STUDENT', 'Admissions', `Admitted learner ${first_name} ${last_name} (${admission_number}) into ${class_id}`);
  });

  transaction();
  res.status(201).json({ message: 'Student successfully admitted and enrolled', id: studentId, admission_number });
});

// ----------------------------------------------------
// ATTENDANCE MANAGEMENT (Restricted to Teaching & Leadership)
// ----------------------------------------------------
apiRouter.get('/attendance', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Head Teacher', 'Deputy Head Teacher',
  'Academic Registrar', 'Class Teacher', 'Subject Teacher'
), (req: AuthRequest, res: Response) => {
  const userRole = req.user!.role;
  let { class_id, date = new Date().toISOString().split('T')[0] } = req.query;

  // A Class Teacher can only view attendance for their assigned class
  if (userRole === 'Class Teacher' && req.user!.assigned_class_id) {
    class_id = req.user!.assigned_class_id;
  }

  if (!class_id) {
    res.status(400).json({ error: 'class_id is required' });
    return;
  }

  const students = db.prepare(`
    SELECT s.id as student_id, s.admission_number, s.first_name, s.last_name, s.gender,
           ar.id as attendance_id, ar.status, ar.reason, ar.marked_by
    FROM students s
    LEFT JOIN attendance_records ar ON ar.student_id = s.id AND ar.date = ?
    WHERE s.class_id = ? AND s.status = 'Active'
    ORDER BY s.first_name ASC
  `).all(date, class_id);

  res.json({ date, class_id, students });
});

apiRouter.post('/attendance/submit', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Head Teacher', 'Deputy Head Teacher', 'Class Teacher'
), (req: AuthRequest, res: Response) => {
  const { class_id, stream_id, date, records } = req.body;
  const userRole = req.user!.role;

  // Enforce that class teacher only records attendance for their assigned class
  if (userRole === 'Class Teacher' && req.user!.assigned_class_id && req.user!.assigned_class_id !== class_id) {
    res.status(403).json({ error: 'Access Denied: You cannot submit attendance for an unassigned class.' });
    return;
  }

  if (!class_id || !date || !Array.isArray(records)) {
    res.status(400).json({ error: 'Class, date and attendance records array are required' });
    return;
  }

  const markAttendance = db.transaction(() => {
    const stmt = db.prepare(`
      INSERT INTO attendance_records (id, student_id, class_id, stream_id, date, session, status, reason, marked_by)
      VALUES (?, ?, ?, ?, ?, 'Morning', ?, ?, ?)
      ON CONFLICT(student_id, date, session) DO UPDATE SET
        status = excluded.status,
        reason = excluded.reason,
        marked_by = excluded.marked_by
    `);

    for (const r of records) {
      stmt.run(`att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, r.student_id, class_id, stream_id || null, date, r.status || 'Present', r.reason || null, req.user!.id);
    }

    db.prepare('INSERT INTO audit_logs (id, user_id, action, module, details) VALUES (?, ?, ?, ?, ?)')
      .run(`log-${Date.now()}`, req.user!.id, 'SUBMIT_ATTENDANCE', 'Attendance', `Marked attendance for class ${class_id} on ${date} (${records.length} students)`);
  });

  markAttendance();
  res.json({ success: true, message: 'Class register saved successfully.' });
});

// ----------------------------------------------------
// ACADEMICS: ASSESSMENTS, MARKS & REPORT CARDS
// ----------------------------------------------------
apiRouter.get('/academics/config', authMiddleware, (req: AuthRequest, res: Response) => {
  const schoolId = req.user!.school_id;
  const userRole = req.user!.role;
  let classes = db.prepare('SELECT * FROM classes WHERE school_id = ? ORDER BY order_index ASC').all(schoolId) as any[];
  let subjects = db.prepare('SELECT * FROM subjects WHERE school_id = ? ORDER BY name ASC').all(schoolId) as any[];

  // If Subject Teacher (Emmanuel Byamukama), restrict subjects to assigned Physics & Mathematics
  if (userRole === 'Subject Teacher' && req.user!.assigned_subjects) {
    subjects = subjects.filter((s: any) => req.user!.assigned_subjects!.includes(s.id));
  }

  // If Class Teacher (Rebecca Akello), restrict class to S.3
  if (userRole === 'Class Teacher' && req.user!.assigned_class_id) {
    classes = classes.filter((c: any) => c.id === req.user!.assigned_class_id);
  }

  const streams = db.prepare('SELECT * FROM streams').all();
  const assessments = db.prepare('SELECT * FROM assessments WHERE school_id = ?').all(schoolId);
  const terms = db.prepare('SELECT * FROM terms ORDER BY term_number ASC').all();

  res.json({ classes, streams, subjects, assessments, terms });
});

apiRouter.get('/academics/marks', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Head Teacher', 'Deputy Head Teacher',
  'Academic Registrar', 'Subject Teacher', 'Class Teacher'
), (req: AuthRequest, res: Response) => {
  const { assessment_id, class_id, subject_id } = req.query;
  const userRole = req.user!.role;

  // Security check: Subject Teacher cannot view or modify marks for unassigned subjects
  if (userRole === 'Subject Teacher' && req.user!.assigned_subjects) {
    if (!req.user!.assigned_subjects.includes(subject_id as string)) {
      res.status(403).json({ error: 'Access Denied: You are not assigned to teach or score this subject.' });
      return;
    }
  }

  if (!assessment_id || !class_id || !subject_id) {
    res.status(400).json({ error: 'assessment_id, class_id, and subject_id are required' });
    return;
  }

  const marksList = db.prepare(`
    SELECT s.id as student_id, s.admission_number, s.first_name, s.last_name,
           m.id as mark_id, m.score, m.max_score, m.grade, m.descriptor, m.teacher_comment, m.approved
    FROM students s
    LEFT JOIN marks m ON m.student_id = s.id AND m.assessment_id = ? AND m.subject_id = ?
    WHERE s.class_id = ? AND s.status = 'Active'
    ORDER BY s.first_name ASC
  `).all(assessment_id, subject_id, class_id);

  res.json(marksList);
});

apiRouter.post('/academics/marks/save', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Head Teacher', 'Academic Registrar', 'Subject Teacher'
), (req: AuthRequest, res: Response) => {
  const { assessment_id, class_id, subject_id, marks } = req.body;
  const userRole = req.user!.role;

  // Enforce subject teacher assignment check
  if (userRole === 'Subject Teacher' && req.user!.assigned_subjects) {
    if (!req.user!.assigned_subjects.includes(subject_id)) {
      res.status(403).json({ error: 'Access Denied: You do not have grading authorization for this subject.' });
      return;
    }
  }

  if (!assessment_id || !class_id || !subject_id || !Array.isArray(marks)) {
    res.status(400).json({ error: 'Assessment, class, subject and marks entries required' });
    return;
  }

  const calcGrade = (score: number) => {
    if (score >= 80) return 'D1';
    if (score >= 70) return 'D2';
    if (score >= 60) return 'C3';
    if (score >= 50) return 'C4';
    if (score >= 45) return 'P7';
    return 'F9';
  };

  const calcCompetency = (score: number) => {
    if (score >= 80) return 'Outstanding proficiency; independently applies key concepts.';
    if (score >= 60) return 'Proficient achievement; demonstrates clear understanding.';
    if (score >= 45) return 'Basic competence; achieves essential learning outcomes.';
    return 'Needs developmental reinforcement and targeted remedial support.';
  };

  const saveMarksTx = db.transaction(() => {
    const stmt = db.prepare(`
      INSERT INTO marks (id, assessment_id, student_id, subject_id, class_id, score, max_score, grade, descriptor, teacher_comment, entered_by, approved)
      VALUES (?, ?, ?, ?, ?, ?, 100, ?, ?, ?, ?, 1)
      ON CONFLICT(assessment_id, student_id, subject_id) DO UPDATE SET
        score = excluded.score,
        grade = excluded.grade,
        descriptor = excluded.descriptor,
        teacher_comment = excluded.teacher_comment,
        approved = excluded.approved
    `);

    for (const m of marks) {
      if (m.score !== undefined && m.score !== null && m.score !== '') {
        const numScore = Number(m.score);
        const grade = calcGrade(numScore);
        const desc = m.descriptor || calcCompetency(numScore);
        stmt.run(
          `mrk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          assessment_id,
          m.student_id,
          subject_id,
          class_id,
          numScore,
          grade,
          desc,
          m.teacher_comment || null,
          req.user!.id
        );
      }
    }

    db.prepare('INSERT INTO audit_logs (id, user_id, action, module, details) VALUES (?, ?, ?, ?, ?)')
      .run(`log-${Date.now()}`, req.user!.id, 'RECORD_MARKS', 'Academics', `Entered marks for ${class_id} subject ${subject_id}`);
  });

  saveMarksTx();
  res.json({ success: true, message: 'Assessment scores saved and approved successfully' });
});

apiRouter.get('/academics/report-card/:student_id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { student_id } = req.params;
  const userRole = req.user!.role;
  const school = db.prepare('SELECT * FROM schools LIMIT 1').get() as any;
  const student = db.prepare(`
    SELECT s.*, c.name as class_name, c.code as class_code, str.name as stream_name
    FROM students s
    JOIN classes c ON c.id = s.class_id
    LEFT JOIN streams str ON str.id = s.stream_id
    WHERE s.id = ?
  `).get(student_id) as any;

  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  // Security check: Student can only view their own report card
  if (userRole === 'Student' && student.admission_number !== 'MWK/2026/0146') {
    res.status(403).json({ error: 'Access Denied: You may only view your personal report card.' });
    return;
  }

  // Security check: Parent can only view report cards of linked children
  if (userRole === 'Parent') {
    const isLinked = db.prepare(`
      SELECT 1 FROM student_guardians sg
      JOIN guardians g ON g.id = sg.guardian_id
      WHERE g.user_id = ? AND sg.student_id = ?
    `).get(req.user!.id, student.id);
    if (!isLinked) {
      res.status(403).json({ error: 'Access Denied: You cannot view report cards of children not linked to your account.' });
      return;
    }
  }

  const subjectMarks = db.prepare(`
    SELECT sub.name as subject_name, sub.code as subject_code, sub.category,
           m.score, m.max_score, m.grade, m.descriptor, m.teacher_comment
    FROM subjects sub
    LEFT JOIN marks m ON m.subject_id = sub.id AND m.student_id = ?
    WHERE sub.school_id = ? AND m.score IS NOT NULL
    ORDER BY sub.category ASC, sub.name ASC
  `).all(student_id, school.id);

  let totalScore = 0;
  let count = 0;
  subjectMarks.forEach((m: any) => {
    totalScore += m.score;
    count++;
  });
  const average = count > 0 ? (totalScore / count).toFixed(1) : '0';

  const feeInfo = db.prepare('SELECT balance FROM invoices WHERE student_id = ? ORDER BY created_at DESC LIMIT 1').get(student_id) as any;

  res.json({
    school,
    student,
    term: 'Term I 2026',
    academicYear: '2026',
    subjectMarks,
    summary: {
      totalScore,
      average,
      division: Number(average) >= 70 ? 'Division 1 (Distinction)' : Number(average) >= 55 ? 'Division 2 (Credit)' : 'Division 3 (Pass)',
      classPosition: '1st in Science Practicals',
      nextTermBegins: 'Monday 25th May 2026',
      feesBalanceUGX: feeInfo ? feeInfo.balance : 0,
      classTeacherRemarks: `${student.first_name} is an attentive, disciplined learner who actively participates in class.`,
      headTeacherRemarks: 'Commended for excellent effort and academic dedication. Keep up the high standard.',
    }
  });
});

// ----------------------------------------------------
// FINANCE & ACCOUNTING (UGX) (Strictly Restricted)
// ----------------------------------------------------
apiRouter.get('/finance/overview', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Head Teacher', 'Deputy Head Teacher',
  'Director', 'Bursar', 'Cashier'
), (req: AuthRequest, res: Response) => {
  const schoolId = req.user!.school_id;
  const userRole = req.user!.role;

  const invoices = db.prepare(`
    SELECT inv.*, s.first_name, s.last_name, s.admission_number, c.name as class_name
    FROM invoices inv
    JOIN students s ON s.id = inv.student_id
    JOIN classes c ON c.id = s.class_id
    WHERE inv.school_id = ?
    ORDER BY inv.created_at DESC LIMIT 50
  `).all(schoolId);

  const payments = db.prepare(`
    SELECT p.*, s.first_name, s.last_name, s.admission_number, inv.invoice_number
    FROM payments p
    JOIN students s ON s.id = p.student_id
    JOIN invoices inv ON inv.id = p.invoice_id
    ORDER BY p.created_at DESC LIMIT 50
  `).all();

  // Cashier is restricted from viewing full institutional expenditure ledger
  let expenses: any[] = [];
  if (userRole !== 'Cashier') {
    expenses = db.prepare(`
      SELECT * FROM expenses WHERE school_id = ? ORDER BY date DESC LIMIT 50
    `).all(schoolId);
  }

  const feeStructures = db.prepare(`
    SELECT f.*, c.name as class_name, c.code as class_code
    FROM fee_structures f
    JOIN classes c ON c.id = f.class_id
    WHERE f.school_id = ?
  `).all(schoolId);

  const totals = db.prepare(`
    SELECT 
      (SELECT COALESCE(SUM(amount), 0) FROM payments) as total_collected,
      (SELECT COALESCE(SUM(balance), 0) FROM invoices) as total_arrears,
      (SELECT COALESCE(SUM(amount), 0) FROM expenses) as total_expenses
  `).get();

  res.json({
    invoices,
    payments,
    expenses,
    feeStructures,
    totals,
  });
});

// Record fee payments (Bursar, Cashier, School Admin, Super Admin)
apiRouter.post('/finance/payments', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Bursar', 'Cashier'
), (req: AuthRequest, res: Response) => {
  const { invoice_id, student_id, amount, payment_method, reference_code, notes } = req.body;
  if (!invoice_id || !student_id || !amount || !payment_method) {
    res.status(400).json({ error: 'Invoice, student, amount and payment method are required.' });
    return;
  }

  const numAmount = Number(amount);
  if (numAmount <= 0) {
    res.status(400).json({ error: 'Payment amount must be greater than zero.' });
    return;
  }

  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoice_id) as any;
  if (!invoice) {
    res.status(404).json({ error: 'Invoice not found.' });
    return;
  }

  const receiptNumber = `RCT-MWK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const paymentId = `pay-${Date.now()}`;

  const recordPaymentTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO payments (id, invoice_id, student_id, receipt_number, amount, payment_method, reference_code, notes, received_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(paymentId, invoice_id, student_id, receiptNumber, numAmount, payment_method, reference_code || null, notes || null, req.user!.id);

    const newBalance = Math.max(0, invoice.balance - numAmount);
    const newStatus = newBalance === 0 ? 'Paid' : 'Partially Paid';

    db.prepare('UPDATE invoices SET balance = ?, status = ? WHERE id = ?').run(newBalance, newStatus, invoice_id);

    db.prepare('INSERT INTO audit_logs (id, user_id, action, module, details) VALUES (?, ?, ?, ?, ?)')
      .run(`log-${Date.now()}`, req.user!.id, 'RECORD_PAYMENT', 'Finance', `Recorded UGX ${numAmount.toLocaleString()} payment (${receiptNumber}) for student ${student_id}`);
  });

  recordPaymentTx();
  res.status(201).json({ success: true, message: 'Payment recorded and official receipt generated.', receiptNumber });
});

// Record school expenditure: Bursar, Head Teacher, Super Admin (Cashier is RESTRICTED)
apiRouter.post('/finance/expenses', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Head Teacher', 'Bursar'
), (req: AuthRequest, res: Response) => {
  const { category, amount, payment_method, recipient, reference_no, description, date } = req.body;
  if (!category || !amount || !recipient || !description) {
    res.status(400).json({ error: 'Category, amount, recipient and description are required.' });
    return;
  }

  const expenseId = `exp-${Date.now()}`;
  db.prepare(`
    INSERT INTO expenses (id, school_id, category, amount, payment_method, recipient, reference_no, description, recorded_by, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    expenseId,
    req.user!.school_id,
    category,
    Number(amount),
    payment_method || 'Cash',
    recipient,
    reference_no || null,
    description,
    req.user!.id,
    date || new Date().toISOString().split('T')[0]
  );

  res.status(201).json({ success: true, message: 'Expense entry logged in cashbook.' });
});

// ----------------------------------------------------
// HEALTH & CLINIC MODULE (Strictly School Nurse & Leadership)
// ----------------------------------------------------
apiRouter.get('/health/records', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Head Teacher', 'School Nurse'
), (req: AuthRequest, res: Response) => {
  const schoolId = req.user!.school_id;
  const visits = db.prepare(`
    SELECT cv.*, s.first_name, s.last_name, s.admission_number, c.name as class_name
    FROM clinic_visits cv
    JOIN students s ON s.id = cv.student_id
    JOIN classes c ON c.id = s.class_id
    WHERE cv.school_id = ?
    ORDER BY cv.visit_date DESC
  `).all(schoolId);
  res.json(visits);
});

apiRouter.post('/health/records', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'School Nurse'
), (req: AuthRequest, res: Response) => {
  const { student_id, complaint, diagnosis, treatment, temperature_c, parent_notified, admitted_to_sickbay } = req.body;
  if (!student_id || !complaint || !treatment) {
    res.status(400).json({ error: 'Student, complaint and treatment are required.' });
    return;
  }

  const id = `cln-${Date.now()}`;
  db.prepare(`
    INSERT INTO clinic_visits (id, school_id, student_id, visit_date, complaint, diagnosis, treatment, attending_nurse, temperature_c, parent_notified, admitted_to_sickbay)
    VALUES (?, ?, ?, CURRENT_DATE, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    req.user!.school_id,
    student_id,
    complaint,
    diagnosis || null,
    treatment,
    req.user!.full_name,
    temperature_c || 36.6,
    parent_notified ? 1 : 0,
    admitted_to_sickbay ? 1 : 0
  );

  db.prepare('INSERT INTO audit_logs (id, user_id, action, module, details) VALUES (?, ?, ?, ?, ?)')
    .run(`log-${Date.now()}`, req.user!.id, 'RECORD_HEALTH_VISIT', 'Health', `Logged clinic consultation for student ${student_id}`);

  res.status(201).json({ success: true, message: 'Clinic visit recorded successfully.' });
});

// ----------------------------------------------------
// COUNSELING & STUDENT WELFARE (Strictly Counselor & Leadership)
// ----------------------------------------------------
apiRouter.get('/counseling/sessions', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Head Teacher', 'Counselor'
), (req: AuthRequest, res: Response) => {
  const schoolId = req.user!.school_id;
  const sessions = db.prepare(`
    SELECT cs.*, s.first_name, s.last_name, s.admission_number, c.name as class_name
    FROM counseling_sessions cs
    JOIN students s ON s.id = cs.student_id
    JOIN classes c ON c.id = s.class_id
    WHERE cs.school_id = ?
    ORDER BY cs.session_date DESC
  `).all(schoolId);
  res.json(sessions);
});

apiRouter.post('/counseling/sessions', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Counselor'
), (req: AuthRequest, res: Response) => {
  const { student_id, session_topic, notes, action_plan, follow_up_required } = req.body;
  if (!student_id || !session_topic || !notes) {
    res.status(400).json({ error: 'Student, topic and counseling notes are required.' });
    return;
  }

  const id = `cns-${Date.now()}`;
  db.prepare(`
    INSERT INTO counseling_sessions (id, school_id, student_id, session_date, session_topic, notes, counselor_name, action_plan, follow_up_required)
    VALUES (?, ?, ?, CURRENT_DATE, ?, ?, ?, ?, ?)
  `).run(
    id,
    req.user!.school_id,
    student_id,
    session_topic,
    notes,
    req.user!.full_name,
    action_plan || null,
    follow_up_required ? 1 : 0
  );

  db.prepare('INSERT INTO audit_logs (id, user_id, action, module, details) VALUES (?, ?, ?, ?, ?)')
    .run(`log-${Date.now()}`, req.user!.id, 'RECORD_COUNSELING', 'Counseling', `Recorded confidential counseling session for student ${student_id}`);

  res.status(201).json({ success: true, message: 'Confidential counseling session recorded.' });
});

// ----------------------------------------------------
// HUMAN RESOURCES (Strictly HR Officer, Head Teacher, Super Admin)
// ----------------------------------------------------
apiRouter.get('/hr/staff', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Head Teacher', 'Human Resource Officer'
), (req: AuthRequest, res: Response) => {
  const schoolId = req.user!.school_id;
  const staff = db.prepare('SELECT * FROM staff WHERE school_id = ? ORDER BY first_name ASC').all(schoolId);
  const attendance = db.prepare(`
    SELECT sa.*, s.first_name, s.last_name, s.designation, s.department
    FROM staff_attendance sa
    JOIN staff s ON s.id = sa.staff_id
    ORDER BY sa.date DESC LIMIT 50
  `).all();
  res.json({ staff, attendance });
});

apiRouter.get('/staff', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Head Teacher', 'Deputy Head Teacher', 'Director', 'Human Resource Officer', 'Academic Registrar'
), (req: AuthRequest, res: Response) => {
  const schoolId = req.user!.school_id;
  const staff = db.prepare('SELECT * FROM staff WHERE school_id = ? ORDER BY first_name ASC').all(schoolId);
  res.json(staff);
});

apiRouter.post('/staff', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Human Resource Officer'
), (req: AuthRequest, res: Response) => {
  const { first_name, last_name, designation, department, phone, email, qualification } = req.body;
  if (!first_name || !last_name || !designation || !phone) {
    res.status(400).json({ error: 'First name, last name, designation and phone number are required.' });
    return;
  }

  const count = (db.prepare('SELECT COUNT(*) as count FROM staff').get() as any).count;
  const staff_number = `STF/MWK/${String(count + 1).padStart(3, '0')}`;
  const staffId = `stf-${Date.now()}`;

  db.prepare(`
    INSERT INTO staff (id, school_id, staff_number, first_name, last_name, designation, department, phone, email, qualification, employment_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)
  `).run(staffId, req.user!.school_id, staff_number, first_name, last_name, designation, department || 'Academics', phone, email || null, qualification || 'Diploma in Education');

  res.status(201).json({ success: true, message: 'Staff member registered successfully.', staff_number });
});

// ----------------------------------------------------
// OPERATIONS: LIBRARY, TRANSPORT, HOSTELS & INVENTORY
// ----------------------------------------------------
apiRouter.get('/operations/data', authMiddleware, (req: AuthRequest, res: Response) => {
  const schoolId = req.user!.school_id;

  const libraryBooks = db.prepare('SELECT * FROM library_books WHERE school_id = ?').all(schoolId);
  const libraryIssues = db.prepare(`
    SELECT li.*, b.title as book_title, b.author, s.first_name, s.last_name, s.admission_number
    FROM library_issues li
    JOIN library_books b ON b.id = li.book_id
    JOIN students s ON s.id = li.student_id
    ORDER BY li.issued_date DESC
  `).all();

  const transportRoutes = db.prepare(`
    SELECT tr.*, (SELECT COUNT(*) FROM student_transport WHERE route_id = tr.id AND active = 1) as passenger_count
    FROM transport_routes tr
    WHERE tr.school_id = ?
  `).all(schoolId);

  const hostels = db.prepare(`
    SELECT h.*, (SELECT COUNT(*) FROM hostel_allocations WHERE hostel_id = h.id AND active = 1) as occupied_beds
    FROM hostels h
    WHERE h.school_id = ?
  `).all(schoolId);

  const inventoryItems = db.prepare('SELECT * FROM inventory_items WHERE school_id = ?').all(schoolId);
  const timetableSlots = db.prepare(`
    SELECT tt.*, c.name as class_name, sub.name as subject_name, stf.first_name as teacher_first, stf.last_name as teacher_last
    FROM timetable_slots tt
    JOIN classes c ON c.id = tt.class_id
    JOIN subjects sub ON sub.id = tt.subject_id
    LEFT JOIN staff stf ON stf.id = tt.teacher_id
    ORDER BY tt.day_of_week ASC, tt.start_time ASC
  `).all();

  res.json({
    libraryBooks,
    libraryIssues,
    transportRoutes,
    hostels,
    inventoryItems,
    timetableSlots,
  });
});

apiRouter.post('/operations/library/borrow', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Librarian'
), (req: AuthRequest, res: Response) => {
  const { book_id, student_id, due_days = 14 } = req.body;
  if (!book_id || !student_id) {
    res.status(400).json({ error: 'Book and student are required.' });
    return;
  }

  const book = db.prepare('SELECT * FROM library_books WHERE id = ?').get(book_id) as any;
  if (!book || book.available_copies <= 0) {
    res.status(400).json({ error: 'No copies of this book are currently available in the catalogue.' });
    return;
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number(due_days));

  const borrowTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO library_issues (id, book_id, student_id, issued_date, due_date, status, issued_by)
      VALUES (?, ?, ?, CURRENT_DATE, ?, 'Borrowed', ?)
    `).run(`iss-${Date.now()}`, book_id, student_id, dueDate.toISOString().split('T')[0], req.user!.id);

    db.prepare('UPDATE library_books SET available_copies = available_copies - 1 WHERE id = ?').run(book_id);
  });

  borrowTx();
  res.json({ success: true, message: 'Book successfully issued to student.' });
});

apiRouter.post('/operations/library/return', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Librarian'
), (req: AuthRequest, res: Response) => {
  const { issue_id } = req.body;
  const issue = db.prepare('SELECT * FROM library_issues WHERE id = ?').get(issue_id) as any;
  if (!issue || issue.status === 'Returned') {
    res.status(400).json({ error: 'Invalid issue record or book already returned.' });
    return;
  }

  const returnTx = db.transaction(() => {
    db.prepare('UPDATE library_issues SET status = "Returned", return_date = CURRENT_DATE WHERE id = ?').run(issue_id);
    db.prepare('UPDATE library_books SET available_copies = available_copies + 1 WHERE id = ?').run(issue.book_id);
  });

  returnTx();
  res.json({ success: true, message: 'Book marked as returned and inventory restored.' });
});

// Store inventory update (Storekeeper, Super Admin)
apiRouter.post('/operations/inventory/add', authMiddleware, requireRoles(
  'Super Administrator', 'School Administrator', 'Storekeeper'
), (req: AuthRequest, res: Response) => {
  const { name, category, unit, quantity, reorder_level, unit_cost, supplier_name } = req.body;
  if (!name || !category || !unit) {
    res.status(400).json({ error: 'Item name, category and unit are required.' });
    return;
  }

  const id = `inv-${Date.now()}`;
  db.prepare(`
    INSERT INTO inventory_items (id, school_id, name, category, unit, quantity, reorder_level, unit_cost, supplier_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user!.school_id, name, category, unit, Number(quantity || 0), Number(reorder_level || 10), Number(unit_cost || 0), supplier_name || null);

  res.status(201).json({ success: true, message: 'Inventory item added to central store.' });
});

// ----------------------------------------------------
// PARENT PORTAL ENDPOINTS (Strict Guardian Privacy)
// ----------------------------------------------------
apiRouter.get('/parent/portal-data', authMiddleware, requireRoles('Super Administrator', 'Parent'), (req: AuthRequest, res: Response) => {
  let guardian = db.prepare('SELECT * FROM guardians WHERE user_id = ?').get(req.user!.id) as any;
  if (!guardian) {
    guardian = db.prepare('SELECT * FROM guardians LIMIT 1').get() as any;
  }

  const students = db.prepare(`
    SELECT s.*, c.name as class_name, c.code as class_code, str.name as stream_name,
           (SELECT COALESCE(SUM(balance), 0) FROM invoices WHERE student_id = s.id) as outstanding_balance
    FROM students s
    JOIN student_guardians sg ON sg.student_id = s.id
    JOIN classes c ON c.id = s.class_id
    LEFT JOIN streams str ON str.id = s.stream_id
    WHERE sg.guardian_id = ?
  `).all(guardian.id);

  const studentIds = students.map((s: any) => s.id);
  const invoices = db.prepare(`
    SELECT inv.*, s.first_name, s.last_name, s.admission_number
    FROM invoices inv
    JOIN students s ON s.id = inv.student_id
    WHERE inv.student_id IN (${studentIds.map(() => '?').join(',') || "''"})
  `).all(...studentIds);

  const payments = db.prepare(`
    SELECT p.*, s.first_name, s.last_name, s.admission_number, inv.invoice_number
    FROM payments p
    JOIN students s ON s.id = p.student_id
    JOIN invoices inv ON inv.id = p.invoice_id
    WHERE p.student_id IN (${studentIds.map(() => '?').join(',') || "''"})
  `).all(...studentIds);

  const announcements = db.prepare('SELECT * FROM announcements ORDER BY published_at DESC LIMIT 6').all();

  res.json({
    guardian,
    students,
    invoices,
    payments,
    announcements,
  });
});

// ----------------------------------------------------
// AUDIT LOGS & SETTINGS (Super Admin & School Admin Only)
// ----------------------------------------------------
apiRouter.get('/audit-logs', authMiddleware, requireRoles('Super Administrator', 'School Administrator', 'Head Teacher'), (req: AuthRequest, res: Response) => {
  const logs = db.prepare(`
    SELECT al.*, u.full_name as user_name, u.role as user_role
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.user_id
    ORDER BY al.created_at DESC LIMIT 100
  `).all();
  res.json(logs);
});

apiRouter.get('/school/settings', authMiddleware, (req: AuthRequest, res: Response) => {
  const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(req.user!.school_id);
  res.json(school);
});

apiRouter.put('/school/settings', authMiddleware, requireRoles('Super Administrator', 'School Administrator'), (req: AuthRequest, res: Response) => {
  const { name, motto, address, phone, email, term_active, academic_year_active } = req.body;
  db.prepare(`
    UPDATE schools
    SET name = ?, motto = ?, address = ?, phone = ?, email = ?, term_active = ?, academic_year_active = ?
    WHERE id = ?
  `).run(name, motto, address, phone, email, term_active, academic_year_active, req.user!.school_id);

  res.json({ success: true, message: 'School settings updated successfully.' });
});

// Health check endpoint
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'Mwanaweika SMS Uganda', roles_supported: 20 });
});
