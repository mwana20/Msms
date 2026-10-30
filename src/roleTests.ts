import { api } from './api';

export interface TestResult {
  title: string;
  category: string;
  passed: boolean;
  message: string;
}

export async function runRoleSecurityTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Helper for running single test
  const test = (title: string, category: string, passed: boolean, message: string) => {
    results.push({ title, category, passed, message });
  };

  try {
    // 1. Unauthenticated Request Rejection Test
    try {
      const url = typeof window !== 'undefined' ? '/api/audit-logs' : 'http://localhost:3000/api/audit-logs';
      const res = await fetch(url);
      test(
        'Unauthenticated request returns 401',
        'API Security',
        res.status === 401,
        res.status === 401 ? 'Blocked with HTTP 401' : `Failed: returned ${res.status}`
      );
    } catch (e: any) {
      test('Unauthenticated request returns 401', 'API Security', false, e.message);
    }

    // 2. Student Role Privacy Test: Brian Kato cannot access other students or bursar records
    try {
      await api.switchRole('Student');
      
      // Attempting to access financial overview
      let financeBlocked = false;
      try {
        await api.getFinanceOverview();
      } catch (err: any) {
        financeBlocked = err.message.includes('403') || err.message.includes('Access Denied');
      }
      test(
        'Student cannot access financial management',
        'Role Restriction',
        financeBlocked,
        financeBlocked ? 'HTTP 403 Forbidden properly returned' : 'Failed: Finance was accessible'
      );

      // Student attempting to fetch another student's profile (Joshua std-joshua)
      let otherStudentBlocked = false;
      try {
        await api.getStudentDetails('std-joshua');
      } catch (err: any) {
        otherStudentBlocked = err.message.includes('403') || err.message.includes('Access Denied');
      }
      test(
        'Student cannot view another student personal profile',
        'Data Privacy',
        otherStudentBlocked,
        otherStudentBlocked ? 'Protected by student identity check' : 'Failed: Student could view peer profile'
      );
    } catch (e: any) {
      test('Student Role Security', 'Role Restriction', false, e.message);
    }

    // 3. Parent Role Isolation Test
    try {
      await api.switchRole('Parent');

      // Parent Sarah Namubiru attempting to access Arnold (std-arnold, unlinked child)
      let unlinkedBlocked = false;
      try {
        await api.getStudentDetails('std-arnold');
      } catch (err: any) {
        unlinkedBlocked = err.message.includes('403') || err.message.includes('Access Denied');
      }
      test(
        'Parent cannot access unlinked child record',
        'Guardian Privacy',
        unlinkedBlocked,
        unlinkedBlocked ? 'HTTP 403: Guardian relationship strictly enforced' : 'Failed: Unauthorized access allowed'
      );

      // Parent can access her own linked child (Brian Kato std-brian)
      const brianProfile = await api.getStudentDetails('std-brian');
      test(
        'Parent can view legally linked child (Brian Kato)',
        'Guardian Privacy',
        Boolean(brianProfile && brianProfile.admission_number === 'MWK/2026/0146'),
        'Parent successfully authorized for linked child'
      );
    } catch (e: any) {
      test('Parent Role Security', 'Guardian Privacy', false, e.message);
    }

    // 4. Class Teacher Restriction Test (Rebecca Akello S.3 Blue)
    try {
      await api.switchRole('Class Teacher');
      
      // Teacher attempting to submit attendance for P.7 (unassigned)
      let unassignedClassBlocked = false;
      try {
        await api.submitAttendance({
          class_id: 'cls-p7',
          date: '2026-10-30',
          records: [{ student_id: 'std-joshua', status: 'Present' }]
        });
      } catch (err: any) {
        unassignedClassBlocked = err.message.includes('403') || err.message.includes('Access Denied');
      }
      test(
        'Class teacher cannot submit attendance for unassigned class',
        'Teacher Authorization',
        unassignedClassBlocked,
        unassignedClassBlocked ? 'Blocked: Teacher restricted to S.3 Blue' : 'Failed: Allowed unassigned class modification'
      );

      // Teacher cannot access bursar ledger
      let financeBlocked = false;
      try {
        await api.getFinanceOverview();
      } catch (err: any) {
        financeBlocked = err.message.includes('403') || err.message.includes('Access Denied');
      }
      test(
        'Teacher cannot access bursar financial accounts',
        'Role Separation',
        financeBlocked,
        financeBlocked ? 'HTTP 403 Forbidden returned' : 'Failed: Teacher accessed financial ledger'
      );
    } catch (e: any) {
      test('Class Teacher Security', 'Teacher Authorization', false, e.message);
    }

    // 5. Cashier Restriction Test (Isaac Mukasa)
    try {
      await api.switchRole('Cashier');

      // Cashier attempting to log general school expenses
      let expenseBlocked = false;
      try {
        await api.recordExpense({
          category: 'Utilities',
          amount: 500000,
          payment_method: 'Cash',
          recipient: 'Umeme',
          description: 'Power test'
        });
      } catch (err: any) {
        expenseBlocked = err.message.includes('403') || err.message.includes('Access Denied');
      }
      test(
        'Cashier cannot authorize unrestricted expenditures',
        'Separation of Duties',
        expenseBlocked,
        expenseBlocked ? 'Blocked: Only Bursar & Head Teacher can post expenditures' : 'Failed: Cashier posted expenditure'
      );
    } catch (e: any) {
      test('Cashier Security', 'Separation of Duties', false, e.message);
    }

    // 6. School Nurse & Counselor Confidentiality Isolation Test
    try {
      await api.switchRole('School Nurse');

      // Nurse attempting to read counseling psychological notes
      let counselingBlocked = false;
      try {
        await api.getCounselingSessions();
      } catch (err: any) {
        counselingBlocked = err.message.includes('403') || err.message.includes('Access Denied');
      }
      test(
        'School nurse cannot access confidential counseling records',
        'Medical & Counseling Privacy',
        counselingBlocked,
        counselingBlocked ? 'HTTP 403: Psychological notes strictly segregated' : 'Failed: Nurse accessed counseling records'
      );

      // Counselor attempting to read medical clinic records
      await api.switchRole('Counselor');
      let clinicBlocked = false;
      try {
        await api.getHealthRecords();
      } catch (err: any) {
        clinicBlocked = err.message.includes('403') || err.message.includes('Access Denied');
      }
      test(
        'Counselor cannot access unrestricted medical clinic records',
        'Medical & Counseling Privacy',
        clinicBlocked,
        clinicBlocked ? 'HTTP 403: Clinic visits segregated from counseling' : 'Failed: Counselor accessed clinic records'
      );
    } catch (e: any) {
      test('Health & Welfare Privacy', 'Medical & Counseling Privacy', false, e.message);
    }

    // 7. Storekeeper Restriction Test (Joseph Ochieng)
    try {
      await api.switchRole('Storekeeper');

      let financeBlocked = false;
      try {
        await api.getFinanceOverview();
      } catch (err: any) {
        financeBlocked = err.message.includes('403') || err.message.includes('Access Denied');
      }
      test(
        'Storekeeper cannot access fee structures or accounting',
        'Role Separation',
        financeBlocked,
        financeBlocked ? 'HTTP 403 Forbidden properly enforced' : 'Failed: Storekeeper accessed fee ledger'
      );
    } catch (e: any) {
      test('Storekeeper Security', 'Role Separation', false, e.message);
    }

    // 8. Super Administrator Elevation & Audit Trail
    try {
      await api.switchRole('Super Administrator');
      const auditLogs = await api.getAuditLogs();
      test(
        'Super Administrator can audit platform logs',
        'Platform Administration',
        Array.isArray(auditLogs) && auditLogs.length > 0,
        `Retrieved ${auditLogs.length} immutable security audit events`
      );
    } catch (e: any) {
      test('Super Administrator Audit', 'Platform Administration', false, e.message);
    }

  } catch (globalErr: any) {
    test('Global Security Suite Execution', 'System', false, globalErr.message);
  }

  return results;
}
