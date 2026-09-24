import { test, expect } from '@playwright/test';

test.describe('College ERP Fee Management & Regression Platform E2E Suite', () => {
  let sampleStudentId: string;
  let sampleDepartmentId: string;
  let baselineRunId: string;
  let defectiveRunId: string;
  let resolvedRunId: string;

  test('01: System Health & Base Configuration', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('college-erp-api');

    // Pre-warm database connection for subsequent tests
    const deptWarm = await request.get('/api/departments');
    expect(deptWarm.status()).toBe(200);
  });

  test('02: Department & Academic Year Invariants', async ({ request }) => {
    const deptRes = await request.get('/api/departments');
    expect(deptRes.status()).toBe(200);
    const deptData = await deptRes.json();
    expect(deptData.success).toBe(true);
    expect(deptData.data.length).toBeGreaterThanOrEqual(5);

    sampleDepartmentId = deptData.data[0].id;
    expect(sampleDepartmentId).toBeDefined();

    const ayRes = await request.get('/api/academic-years');
    expect(ayRes.status()).toBe(200);
    const ayData = await ayRes.json();
    expect(ayData.success).toBe(true);
    expect(ayData.data.length).toBeGreaterThanOrEqual(1);
  });

  test('03: Student Management & Fee Ledger Inspection', async ({ request }) => {
    const stuRes = await request.get('/api/students?limit=10');
    expect(stuRes.status()).toBe(200);
    const stuData = await stuRes.json();
    expect(stuData.success).toBe(true);
    expect(stuData.data.length).toBeGreaterThanOrEqual(1);

    sampleStudentId = stuData.data[0].id;

    // Student profile
    const profileRes = await request.get(`/api/students/${sampleStudentId}`);
    expect(profileRes.status()).toBe(200);
    const profile = await profileRes.json();
    expect(profile.success).toBe(true);
    expect(profile.data.rollNumber).toBeDefined();

    // Student Ledger
    const ledgerRes = await request.get(`/api/students/${sampleStudentId}/ledger`);
    expect(ledgerRes.status()).toBe(200);
    const ledger = await ledgerRes.json();
    expect(ledger.success).toBe(true);
    expect(ledger.data.student.id).toBe(sampleStudentId);
  });

  test('04: Pure Fee Calculation API Contract', async ({ request }) => {
    const calcRes = await request.post('/api/fees/calculate', {
      data: {
        components: [
          { name: 'Tuition Fee', amount: 40000, type: 'TUITION' },
          { name: 'Exam Fee', amount: 5000, type: 'EXAMINATION' },
          { name: 'Library Fee', amount: 2000, type: 'LIBRARY' },
          { name: 'Lab Fee', amount: 3000, type: 'LABORATORY' },
        ],
        dueDate: '2025-10-15T00:00:00.000Z',
        calculationDate: '2025-10-01T00:00:00.000Z',
        scholarships: [
          { code: 'MERIT-10', name: 'Merit Scholarship', type: 'PERCENTAGE', value: 10 },
        ],
      },
    });

    expect(calcRes.status()).toBe(200);
    const calc = await calcRes.json();
    expect(calc.success).toBe(true);
    expect(calc.data.baseAmount).toBe(50000);
    expect(calc.data.scholarshipAmount).toBe(5000);
    expect(calc.data.netPayable).toBe(45000);
  });

  test('05: Reporting Subsystem Derivations', async ({ request }) => {
    // 1. Student Report
    const sReportRes = await request.get(`/api/reports/student/${sampleStudentId}`);
    expect(sReportRes.status()).toBe(200);
    const sReport = await sReportRes.json();
    expect(sReport.success).toBe(true);

    // 2. Department Report
    const dReportRes = await request.get(`/api/reports/department/${sampleDepartmentId}`);
    expect(dReportRes.status()).toBe(200);
    const dReport = await dReportRes.json();
    expect(dReport.success).toBe(true);
    expect(dReport.data.summary.totalStudents).toBeGreaterThan(0);

    // 3. Monthly Report
    const mReportRes = await request.get('/api/reports/monthly');
    expect(mReportRes.status()).toBe(200);
    const mReport = await mReportRes.json();
    expect(mReport.success).toBe(true);

    // 4. Outstanding Report
    const oReportRes = await request.get('/api/reports/outstanding');
    expect(oReportRes.status()).toBe(200);
    const oReport = await oReportRes.json();
    expect(oReport.success).toBe(true);
  });

  test('06: Case Study Step 1 - Baseline v1.0 Clean Run', async ({ request }) => {
    // Ensure defect is OFF
    await request.post('/api/testing/defects/toggle', {
      data: { defectKey: 'DOUBLE_LIBRARY_FEE', isActive: false },
    });

    const runRes = await request.post('/api/testing/runs', {
      data: {
        suiteCode: 'FULL_REGRESSION',
        triggerSource: 'PLAYWRIGHT_E2E',
      },
    });
    expect(runRes.status()).toBe(201);
    const run = await runRes.json();
    expect(run.success).toBe(true);
    expect(run.data.status).toBe('PASSED');
    expect(run.data.failed).toBe(0);
    baselineRunId = run.data.id;
  });

  test('07: Case Study Step 2 - Defect Injected v1.1 Run (Regression Detected)', async ({ request }) => {
    // Toggle defect ON
    const toggleRes = await request.post('/api/testing/defects/toggle', {
      data: { defectKey: 'DOUBLE_LIBRARY_FEE', isActive: true },
    });
    expect(toggleRes.status()).toBe(200);

    // Execute run under defect
    const runRes = await request.post('/api/testing/runs', {
      data: {
        suiteCode: 'FULL_REGRESSION',
        triggerSource: 'PLAYWRIGHT_E2E',
      },
    });
    expect(runRes.status()).toBe(201);
    const run = await runRes.json();
    expect(run.success).toBe(true);
    expect(run.data.status).toBe('FAILED');
    expect(run.data.failed).toBeGreaterThan(0);
    defectiveRunId = run.data.id;
  });

  test('08: Case Study Step 3 - Defect Resolved v1.2 Run & Diff Comparison', async ({ request }) => {
    // Toggle defect OFF
    await request.post('/api/testing/defects/toggle', {
      data: { defectKey: 'DOUBLE_LIBRARY_FEE', isActive: false },
    });

    // Execute clean run
    const runRes = await request.post('/api/testing/runs', {
      data: {
        suiteCode: 'FULL_REGRESSION',
        triggerSource: 'PLAYWRIGHT_E2E',
      },
    });
    expect(runRes.status()).toBe(201);
    const run = await runRes.json();
    expect(run.success).toBe(true);
    expect(run.data.status).toBe('PASSED');
    resolvedRunId = run.data.id;

    // Run Comparison (Baseline vs Defective)
    const compareRes = await request.get(
      `/api/testing/compare?baseRunId=${baselineRunId}&candidateRunId=${defectiveRunId}`
    );
    expect(compareRes.status()).toBe(200);
    const compare = await compareRes.json();
    expect(compare.success).toBe(true);
    expect(compare.data.hasRegression).toBe(true);
    expect(compare.data.regressions.length).toBeGreaterThan(0);
  });
});
