const BASE_URL = 'http://localhost:4000';

interface CheckResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  notes: string;
}

const results: CheckResult[] = [];

async function check(
  name: string,
  method: string,
  path: string,
  body?: any,
  validate?: (json: any) => boolean
) {
  try {
    const opts: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, opts);
    let json: any = null;
    try {
      json = await res.json();
    } catch {}

    const isValid = validate ? validate(json) : json?.success === true;
    results.push({
      endpoint: path,
      method,
      status: res.status,
      success: isValid,
      notes: isValid ? 'OK' : `Failed: ${JSON.stringify(json?.error || json)}`,
    });
    return json;
  } catch (err: any) {
    results.push({
      endpoint: path,
      method,
      status: 0,
      success: false,
      notes: err.message,
    });
    return null;
  }
}

async function run() {
  console.log('=================================================================');
  console.log('🚀 SYSTEMATIC LIVE API ENDPOINT AUDIT (ALL 25 CONTRACT ENDPOINTS)');
  console.log('=================================================================\n');

  // 1. Health
  await check('Health Check', 'GET', '/health', undefined, (j) => j?.status === 'ok');

  // 2. Departments
  const deptRes = await check('List Departments', 'GET', '/api/departments');
  const deptId = deptRes?.data?.[0]?.id;

  if (deptId) {
    await check('Get Department by ID', 'GET', `/api/departments/${deptId}`);
  }

  // 3. Academic Years
  const ayRes = await check('List Academic Years', 'GET', '/api/academic-years');
  const ayId = ayRes?.data?.[0]?.id;

  // 4. Students
  const stuRes = await check('List Students', 'GET', '/api/students?limit=5');
  const stuId = stuRes?.data?.[0]?.id;

  if (stuId) {
    await check('Get Student Profile', 'GET', `/api/students/${stuId}`);
    await check('Get Student Ledger', 'GET', `/api/students/${stuId}/ledger`);
  }

  // 5. Fees Calculation Preview
  await check('Calculate Fee Preview', 'POST', '/api/fees/calculate', {
    components: [
      { name: 'Tuition Fee', amount: 40000, type: 'TUITION' },
      { name: 'Exam Fee', amount: 5000, type: 'EXAMINATION' },
      { name: 'Library Fee', amount: 2000, type: 'LIBRARY' },
      { name: 'Lab Fee', amount: 3000, type: 'LABORATORY' },
    ],
    dueDate: '2025-10-15T00:00:00.000Z',
    calculationDate: '2025-10-01T00:00:00.000Z',
    scholarships: [{ code: 'MERIT-10', name: 'Merit Scholarship', type: 'PERCENTAGE', value: 10 }],
  });

  // 6. Payments
  const payRes = await check('List Payments', 'GET', '/api/payments?limit=5');
  const paymentId = payRes?.data?.[0]?.id;
  if (paymentId) {
    await check('Get Payment by ID', 'GET', `/api/payments/${paymentId}`);
  }

  // 7. Reports
  if (stuId) {
    await check('Student Fee Report', 'GET', `/api/reports/student/${stuId}`);
  }
  if (deptId) {
    await check('Department Fee Report', 'GET', `/api/reports/department/${deptId}`);
  }
  await check('Monthly Collection Report', 'GET', '/api/reports/monthly');
  await check('Outstanding Balance Report', 'GET', '/api/reports/outstanding');

  // 8. Regression Testing Subsystem
  await check('List Test Suites', 'GET', '/api/testing/suites');
  await check('List Test Cases', 'GET', '/api/testing/test-cases');
  await check('Get Defect Simulation Status', 'GET', '/api/testing/defects');

  // Toggle Defect On & Off
  await check('Toggle Defect ON', 'POST', '/api/testing/defects/toggle', {
    defectKey: 'DOUBLE_LIBRARY_FEE',
    enabled: true,
  });

  const testRunDefective = await check('Run Regression Suite (Defect Active)', 'POST', '/api/testing/runs', {
    version: '1.1-audit',
    description: 'Audit test with defect active',
  });

  await check('Toggle Defect OFF', 'POST', '/api/testing/defects/toggle', {
    defectKey: 'DOUBLE_LIBRARY_FEE',
    enabled: false,
  });

  const testRunClean = await check('Run Regression Suite (Clean v1.2)', 'POST', '/api/testing/runs', {
    version: '1.2-audit',
    description: 'Audit test with defect resolved',
  });

  const runsList = await check('List Historical Runs', 'GET', '/api/testing/runs');
  const runId = runsList?.data?.[0]?.id;
  if (runId) {
    await check('Get Run Details', 'GET', `/api/testing/runs/${runId}`);
  }

  // Compare runs
  const candidateId = testRunDefective?.data?.id;
  const baseId = testRunClean?.data?.id;
  if (baseId && candidateId) {
    await check(
      'Compare Test Runs (Diff Viewer)',
      'GET',
      `/api/testing/compare?baseRunId=${baseId}&candidateRunId=${candidateId}`
    );
  }

  console.log('\n--- AUDIT RESULTS TABLE ---\n');
  console.table(
    results.map((r) => ({
      Method: r.method,
      Endpoint: r.endpoint.length > 40 ? r.endpoint.slice(0, 37) + '...' : r.endpoint,
      Status: r.status,
      Result: r.success ? '✅ PASS' : '❌ FAIL',
      Notes: r.notes,
    }))
  );

  const total = results.length;
  const passed = results.filter((r) => r.success).length;
  console.log(`\nTOTAL ENDPOINTS CHECKED: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${total - passed}`);
  console.log(`AUDIT SCORE: ${((passed / total) * 100).toFixed(1)}%\n`);
}

run();
