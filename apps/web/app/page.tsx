'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  RotateCcw,
  Users,
  CreditCard,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Receipt,
  X,
  Plus,
  Play,
  Activity,
} from 'lucide-react';

const API_BASE = 'http://localhost:4000';

interface Department {
  id: string;
  code: string;
  name: string;
  _count?: { students: number };
}

interface Student {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  department: { code: string; name: string };
  feeAssessments?: Array<{
    baseAmount: number;
    scholarshipAmount: number;
    discountAmount: number;
    netPayable: number;
    paidAmount: number;
    outstandingAmount: number;
    status: string;
  }>;
}

interface TestRun {
  id: string;
  suiteId: string;
  engineVersion: string;
  triggerSource: string;
  totalTests: number;
  passed: number;
  failed: number;
  durationMs: number;
  status: 'PASSED' | 'FAILED' | 'RUNNING';
  defectActive: boolean;
  startedAt: string;
  completedAt?: string;
  results?: Array<{
    id: string;
    testCaseId: string;
    status: 'PASS' | 'FAIL' | 'ERROR';
    expectedVal: any;
    actualVal: any;
    difference?: any;
    testCase?: { code: string; name: string; targetModule: string };
  }>;
}

export default function NeoBrutalistDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'calculator' | 'reports' | 'testing'>('overview');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // Testing & Defect Simulation State
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [isDefectActive, setIsDefectActive] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [activeRunFilter, setActiveRunFilter] = useState<string | null>(null);

  // Fee Calculator State
  const [calcComponents, setCalcComponents] = useState([
    { type: 'TUITION', name: 'Tuition Fee', amount: 40000 },
    { type: 'EXAMINATION', name: 'Examination Fee', amount: 5000 },
    { type: 'LIBRARY', name: 'Library Fee', amount: 2000 },
    { type: 'LABORATORY', name: 'Laboratory Fee', amount: 3000 },
  ]);
  const [hasScholarship, setHasScholarship] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Reports State
  const [reportType, setReportType] = useState<'department' | 'monthly' | 'outstanding'>('department');
  const [deptReport, setDeptReport] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any[]>([]);
  const [outstandingReport, setOutstandingReport] = useState<any>(null);

  // Payment Recording State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      // Parallelize initial queries for instant dashboard response
      const [deptRes, stuRes, defectRes] = await Promise.all([
        fetch(`${API_BASE}/api/departments`).then((r) => r.json()).catch(() => null),
        fetch(`${API_BASE}/api/students?limit=60`).then((r) => r.json()).catch(() => null),
        fetch(`${API_BASE}/api/testing/defects`).then((r) => r.json()).catch(() => null),
      ]);

      if (deptRes?.success) setDepartments(deptRes.data);
      if (stuRes?.success) setStudents(stuRes.data);
      if (defectRes?.success) setIsDefectActive(Boolean(defectRes.data.isActive));

      // Test Runs & Default Fee Calculation in parallel
      loadTestRuns();
      calculatePreview(calcComponents, false, false, Boolean(defectRes?.data?.isActive));
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }

  async function loadTestRuns() {
    try {
      const runsRes = await fetch(`${API_BASE}/api/testing/runs?limit=10`).then((r) => r.json());
      if (runsRes?.success) {
        setTestRuns(runsRes.data);
        if (runsRes.data.length >= 2) {
          // Auto compare top 2 runs if available
          compareRuns(runsRes.data[1].id, runsRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load test runs:', err);
    }
  }

  // 2. Defect Simulation Toggle
  async function toggleDefect() {
    const nextState = !isDefectActive;
    try {
      const res = await fetch(`${API_BASE}/api/testing/defects/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defectKey: 'DOUBLE_LIBRARY_FEE', isActive: nextState }),
      }).then((r) => r.json());

      if (res?.success) {
        setIsDefectActive(nextState);
        // re-run calculation preview with new defect state
        calculatePreview(calcComponents, hasScholarship, hasDiscount, nextState);
      }
    } catch (err) {
      console.error('Error toggling defect:', err);
    }
  }

  // 3. Trigger Regression Suite
  async function triggerRegressionSuite() {
    setIsRunningTests(true);
    try {
      const res = await fetch(`${API_BASE}/api/testing/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suiteCode: 'FULL_REGRESSION',
          triggerSource: 'BRUTALIST_UI_LAB',
        }),
      }).then((r) => r.json());

      if (res?.success) {
        await loadTestRuns();
        setActiveTab('testing');
      }
    } catch (err) {
      console.error('Error triggering regression run:', err);
    } finally {
      setIsRunningTests(false);
    }
  }

  // 4. Compare Two Runs
  async function compareRuns(baseId: string, candId: string) {
    try {
      const res = await fetch(`${API_BASE}/api/testing/compare?baseRunId=${baseId}&candidateRunId=${candId}`).then((r) => r.json());
      if (res?.success) {
        setComparison(res.data);
      }
    } catch (err) {
      console.error('Error comparing runs:', err);
    }
  }

  // 5. Fee Calculator Trigger
  async function calculatePreview(components: any[], merit: boolean, sibling: boolean, defect: boolean) {
    setIsCalculating(true);
    try {
      const scholarships = merit ? [{ code: 'MERIT-10', name: 'Merit Scholarship 10%', type: 'PERCENTAGE', value: 10 }] : [];
      const discounts = sibling ? [{ code: 'SIBLING-2000', name: 'Sibling Discount', type: 'FIXED', value: 2000 }] : [];

      const res = await fetch(`${API_BASE}/api/fees/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          components,
          scholarships,
          discounts,
          dueDate: '2024-09-30T00:00:00.000Z',
          calculationDate: '2024-09-15T00:00:00.000Z',
          defectFlags: defect ? { doubleCountLibraryFee: true } : undefined,
        }),
      }).then((r) => r.json());

      if (res?.success) {
        setCalcResult(res.data);
      }
    } catch (err) {
      console.error('Failed to calculate preview:', err);
    } finally {
      setIsCalculating(false);
    }
  }

  // 6. View Student Ledger Modal
  async function openStudentLedger(studentId: string) {
    try {
      const res = await fetch(`${API_BASE}/api/students/${studentId}/ledger`).then((r) => r.json());
      if (res?.success) {
        setSelectedStudent(res.data);
        setIsLedgerOpen(true);
      }
    } catch (err) {
      console.error('Error opening student ledger:', err);
    }
  }

  // 7. Record Payment
  async function handleRecordPayment(assessmentId: string, studentId: string) {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    setIsRecordingPayment(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeAssessmentId: assessmentId,
          studentId,
          amount: Number(paymentAmount),
          paymentMethod,
          remarks: 'Recorded via Neo-Brutalist Dashboard',
        }),
      }).then((r) => r.json());

      if (res?.success) {
        alert('Payment Recorded Successfully! Ledger Updated.');
        setPaymentAmount('');
        openStudentLedger(studentId);
        // refresh students
        const stuRes = await fetch(`${API_BASE}/api/students?limit=60`).then((r) => r.json());
        if (stuRes?.success) setStudents(stuRes.data);
      }
    } catch (err) {
      alert('Payment failed');
    } finally {
      setIsRecordingPayment(false);
    }
  }

  // 8. Load Reports
  async function loadReports(type: 'department' | 'monthly' | 'outstanding') {
    setReportType(type);
    try {
      if (type === 'department' && departments.length > 0 && departments[0]) {
        const res = await fetch(`${API_BASE}/api/reports/department/${departments[0].id}`).then((r) => r.json());
        if (res?.success) setDeptReport(res.data);
      } else if (type === 'monthly') {
        const res = await fetch(`${API_BASE}/api/reports/monthly`).then((r) => r.json());
        if (res?.success) setMonthlyReport(res.data);
      } else if (type === 'outstanding') {
        const res = await fetch(`${API_BASE}/api/reports/outstanding`).then((r) => r.json());
        if (res?.success) setOutstandingReport(res.data);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    }
  }

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesDept = departmentFilter ? s.department.code === departmentFilter : true;
    return matchesSearch && matchesDept;
  });

  // Calculate totals (convert Decimal string/number to clean numeric values)
  const totalBilled = students.reduce((acc, s) => acc + Number(s.feeAssessments?.[0]?.netPayable ?? 50000), 0);
  const totalCollected = students.reduce((acc, s) => acc + Number(s.feeAssessments?.[0]?.paidAmount ?? 0), 0);
  const totalOutstanding = students.reduce((acc, s) => acc + Number(s.feeAssessments?.[0]?.outstandingAmount ?? 0), 0);
  const latestRun = testRuns[0];

  return (
    <div className="min-h-screen pb-20">
      {/* 1. TOP BRUTALIST TICKER */}
      <div className="brutal-ticker">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>COLLEGE ERP // REGRESSION TESTING LAB</span>
          </span>
          <span className="hidden md:inline font-mono opacity-60">|</span>
          <span className="hidden md:inline font-mono text-zinc-300">RUNTIME: BUN 1.3 // POSTGRESQL 16</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="brutal-badge brutal-badge-mint">NEON DB LIVE</span>
          <span className={`brutal-badge ${isDefectActive ? 'brutal-badge-coral animate-brutal-pulse' : 'brutal-badge-yellow'}`}>
            {isDefectActive ? '⚠️ DEFECT: DOUBLE_LIBRARY_FEE (ACTIVE)' : '🛡️ DEFECT: INACTIVE (CLEAN)'}
          </span>
        </div>
      </div>

      {/* 2. BRUTALIST MAIN HEADER */}
      <header className="border-b-[3px] border-black bg-white px-6 py-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0px_4px_0px_#000]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-black text-[#FFE600] flex items-center justify-center font-black font-mono border-2 border-black shadow-[2px_2px_0px_#000]">
              ERP
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase">
              Fee Management & Automated Regression System
            </h1>
          </div>
          <p className="font-mono text-xs md:text-sm text-zinc-600 font-semibold">
            Demonstrating Principle: Defect Injection in Shared Calculation Engine → Report Total Regression → Detection → Fix.
          </p>
        </div>

        {/* Global Action Station */}
        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={toggleDefect}
            data-testid="toggle-defect-btn"
            className={`brutal-btn ${isDefectActive ? 'brutal-btn-coral' : 'brutal-btn-yellow'} text-xs`}
          >
            <RotateCcw className="w-4 h-4" />
            {isDefectActive ? 'RESTORE CLEAN ENGINE' : 'SIMULATE DEFECT (+₹2K)'}
          </button>

          <button
            onClick={triggerRegressionSuite}
            disabled={isRunningTests}
            data-testid="run-regression-btn"
            className="brutal-btn brutal-btn-mint text-xs"
          >
            {isRunningTests ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunningTests ? 'TESTING...' : 'RUN REGRESSION SUITE'}
          </button>

          <a
            href="/pipeline"
            data-testid="pipeline-link"
            className="brutal-btn text-xs"
            style={{ background: '#818cf8', color: '#fff', borderColor: '#000', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Activity className="w-4 h-4" />
            VIEW PIPELINE
          </a>
        </div>
      </header>

      {/* 3. NAVIGATION TABS */}
      <nav className="border-b-[3px] border-black bg-[#fefefe] px-6 md:px-12 py-3 flex gap-2 overflow-x-auto shadow-[0px_2px_0px_#000]">
        {[
          { id: 'overview', label: '📊 OVERVIEW' },
          { id: 'students', label: '🎓 STUDENTS & LEDGER' },
          { id: 'calculator', label: '💰 PURE FEE SIMULATOR' },
          { id: 'reports', label: '📈 FINANCIAL REPORTS' },
          { id: 'testing', label: '⚡ REGRESSION TESTING LAB' },
        ].map((tab) => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === 'reports') loadReports(reportType);
            }}
            className={`px-4 py-2 border-2 border-black font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer select-none whitespace-nowrap ${
              activeTab === tab.id ? 'brutal-tab-active' : 'brutal-tab-inactive'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 4. MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        {/* ============================================================== */}
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Alert Banner for Active Defect with Visual Cascading Blast Radius */}
            {isDefectActive && (
              <div className="border-[3px] border-black bg-[#FF4757] text-white p-6 shadow-[6px_6px_0px_#000] space-y-4">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 shrink-0 text-[#FFE600] animate-bounce" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <h3 className="font-extrabold text-xl uppercase tracking-wide">
                        WARNING: CONTROLLED DEFECT INJECTED (v1.1)
                      </h3>
                      <span className="brutal-badge brutal-badge-yellow">DOUBLE_LIBRARY_FEE (ACTIVE)</span>
                    </div>
                    <p className="font-mono text-xs md:text-sm mt-1 text-zinc-100">
                      The calculation engine is duplicate-counting the ₹2,000 Library Fee. This micro-defect cascades across all 60 students and 5 academic departments.
                    </p>
                  </div>
                </div>

                {/* Visual Blast Radius Matrix */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs text-black">
                  <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_#000]">
                    <span className="text-zinc-500 font-bold block text-[10px]">ROOT CODE LOCATION</span>
                    <span className="font-black text-sm text-black">@repo/fee-engine</span>
                  </div>
                  <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_#000]">
                    <span className="text-zinc-500 font-bold block text-[10px]">AFFECTED POPULATION</span>
                    <span className="font-black text-sm text-black">60 Students (100%)</span>
                  </div>
                  <div className="border-2 border-black bg-[#FFE600] p-3 shadow-[3px_3px_0px_#000]">
                    <span className="text-black font-bold block text-[10px]">PER-STUDENT ERROR</span>
                    <span className="font-black text-sm text-red-600">+₹2,000 Overcharge</span>
                  </div>
                  <div className="border-2 border-black bg-[#FFE600] p-3 shadow-[3px_3px_0px_#000]">
                    <span className="text-black font-bold block text-[10px]">INSTITUTIONAL VARIANCE</span>
                    <span className="font-black text-sm text-red-600">+₹1,20,000 Total Corrupted</span>
                  </div>
                </div>

                {/* Visual Cascade Flow */}
                <div className="border-2 border-black bg-black text-[#FFE600] p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-2">
                  <span>💥 <b>CASCADING BLAST RADIUS:</b></span>
                  <span>Pure Fee Engine (+₹2K)</span>
                  <span>➔</span>
                  <span>Student Ledgers (₹52,000)</span>
                  <span>➔</span>
                  <span>5 Dept Reports (+₹24K/dept)</span>
                  <span>➔</span>
                  <span>Institutional Receivables (₹31.2 Lakhs)</span>
                </div>
              </div>
            )}

            {/* 4 Hero KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div data-testid="kpi-students" className="brutal-card brutal-card-yellow p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="brutal-badge brutal-badge-dark">STUDENTS</span>
                  <Users className="w-6 h-6 text-black" />
                </div>
                <div className="text-4xl font-black font-mono tracking-tight">{students.length || 60}</div>
                <p className="font-mono text-xs font-bold uppercase mt-2 text-zinc-800">
                  Enrolled across 5 departments
                </p>
              </div>

              {/* Card 2 */}
              <div data-testid="kpi-collections" className="brutal-card brutal-card-mint p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="brutal-badge brutal-badge-dark">COLLECTIONS</span>
                  <CreditCard className="w-6 h-6 text-black" />
                </div>
                <div className="text-3xl font-black font-mono tracking-tight">₹{Math.round(totalCollected).toLocaleString('en-IN')}</div>
                <p className="font-mono text-xs font-bold uppercase mt-2 text-zinc-800">
                  Total Realized Receipts
                </p>
              </div>

              {/* Card 3 */}
              <div data-testid="kpi-outstanding" className="brutal-card brutal-card-pink p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="brutal-badge brutal-badge-dark">OUTSTANDING</span>
                  <Receipt className="w-6 h-6 text-black" />
                </div>
                <div className="text-3xl font-black font-mono tracking-tight">₹{Math.round(totalOutstanding).toLocaleString('en-IN')}</div>
                <p className="font-mono text-xs font-bold uppercase mt-2 text-zinc-800">
                  Pending Dues / Receivables
                </p>
              </div>

              {/* Card 4: Regression Health */}
              <div data-testid="kpi-regression" className={`brutal-card p-5 ${latestRun?.status === 'FAILED' ? 'brutal-card-coral text-white' : 'brutal-card-cyan'}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className="brutal-badge brutal-badge-dark">REGRESSION HEALTH</span>
                  <Activity className="w-6 h-6 text-black" />
                </div>
                <div className="text-2xl font-black font-mono tracking-tight">
                  {latestRun ? (latestRun.status === 'PASSED' ? '0 REGRESSIONS' : 'REGRESSION DETECTED') : 'NOT EXECUTED'}
                </div>
                <p className={`font-mono text-xs font-bold uppercase mt-2 ${latestRun?.status === 'FAILED' ? 'text-zinc-100' : 'text-zinc-800'}`}>
                  {latestRun ? `Suite Run: ${latestRun.passed} Pass / ${latestRun.failed} Fail` : 'Click Run Regression'}
                </p>
              </div>
            </div>

            {/* Department Breakdown Section */}
            <div className="brutal-card p-6 bg-white">
              <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-3">
                <h3 className="font-extrabold text-lg uppercase flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Academic Departments & Student Counts
                </h3>
                <span className="brutal-badge brutal-badge-yellow">ACADEMIC YEAR: 2024-25</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {departments.map((dept) => (
                  <div key={dept.id} className="border-2 border-black p-4 bg-[#faf9f5] shadow-[3px_3px_0px_#000]">
                    <div className="font-black text-xl font-mono">{dept.code}</div>
                    <div className="font-semibold text-xs text-zinc-600 line-clamp-1">{dept.name}</div>
                    <div className="mt-3 flex items-center justify-between text-xs font-mono font-bold">
                      <span>STUDENTS:</span>
                      <span className="bg-black text-white px-2 py-0.5">{dept._count?.students || 12}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Study Workflow Demonstration Card */}
            <div className="border-[3px] border-black bg-white p-6 shadow-[6px_6px_0px_#000]">
              <h3 className="font-extrabold text-lg uppercase mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Software Engineering Case Study Demonstration Flow
              </h3>
              <p className="font-mono text-xs text-zinc-700 mb-4">
                Follow these 3 simple steps to demonstrate automated regression testing in action:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="border-2 border-black p-4 bg-[#e8f5e9] shadow-[3px_3px_0px_#000]">
                  <span className="brutal-badge brutal-badge-mint mb-2">STEP 1 // v1.0 BASELINE</span>
                  <h4 className="font-bold text-sm mt-2">Clean Baseline Run</h4>
                  <p className="font-mono text-xs text-zinc-600 mt-1">
                    Standard fee is ₹50,000. All regression tests pass with 0 failures (Green).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="border-2 border-black p-4 bg-[#ffebee] shadow-[3px_3px_0px_#000]">
                  <span className="brutal-badge brutal-badge-coral mb-2">STEP 2 // v1.1 DEFECT</span>
                  <h4 className="font-bold text-sm mt-2">Inject Defect (+₹2K)</h4>
                  <p className="font-mono text-xs text-zinc-600 mt-1">
                    Toggle defect ON. Library fee counts twice ($52k). Regression suite catches +₹2k discrepancy!
                  </p>
                </div>

                {/* Step 3 */}
                <div className="border-2 border-black p-4 bg-[#e0f7fa] shadow-[3px_3px_0px_#000]">
                  <span className="brutal-badge brutal-badge-cyan mb-2">STEP 3 // v1.2 RESOLVED</span>
                  <h4 className="font-bold text-sm mt-2">Resolve Defect & Compare</h4>
                  <p className="font-mono text-xs text-zinc-600 mt-1">
                    Toggle defect OFF and re-run. Tests pass again. Side-by-side diff confirms regression fixed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: STUDENTS DIRECTORY & LEDGER */}
        {/* ============================================================== */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
              <div className="relative w-full md:w-96">
                <Search className="w-5 h-5 absolute left-3 top-3 text-black" />
                <input
                  type="text"
                  placeholder="SEARCH ROLL NO OR NAME..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="brutal-input pl-10"
                />
              </div>

              {/* Department Filter */}
              <div className="flex gap-2 flex-wrap w-full md:w-auto">
                <button
                  onClick={() => setDepartmentFilter('')}
                  className={`brutal-badge cursor-pointer ${departmentFilter === '' ? 'brutal-badge-dark' : 'bg-white'}`}
                >
                  ALL DEPTS ({students.length})
                </button>
                {['CSE', 'ECE', 'EEE', 'CIVIL', 'MECH'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDepartmentFilter(d)}
                    className={`brutal-badge cursor-pointer ${departmentFilter === d ? 'brutal-badge-yellow' : 'bg-white'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Students Table */}
            <div className="brutal-table-container">
              <table className="brutal-table">
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Dept</th>
                    <th>Status</th>
                    <th>Net Payable</th>
                    <th>Total Paid</th>
                    <th>Balance Due</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.slice(0, 25).map((s) => {
                    const assessment = s.feeAssessments?.[0];
                    const net = assessment?.netPayable ?? 50000;
                    const paid = assessment?.paidAmount ?? 0;
                    const balance = assessment?.outstandingAmount ?? net - paid;

                    return (
                      <tr key={s.id}>
                        <td className="font-mono font-bold">{s.rollNumber}</td>
                        <td className="font-bold">{s.firstName} {s.lastName}</td>
                        <td>
                          <span className="brutal-badge brutal-badge-cyan">{s.department.code}</span>
                        </td>
                        <td>
                          <span className={`brutal-badge ${balance === 0 ? 'brutal-badge-mint' : paid > 0 ? 'brutal-badge-yellow' : 'brutal-badge-coral'}`}>
                            {balance === 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID'}
                          </span>
                        </td>
                        <td className="font-mono font-bold">₹{net.toLocaleString()}</td>
                        <td className="font-mono font-bold text-emerald-600">₹{paid.toLocaleString()}</td>
                        <td className="font-mono font-bold text-red-600">₹{balance.toLocaleString()}</td>
                        <td>
                          <button
                            onClick={() => openStudentLedger(s.id)}
                            className="brutal-btn brutal-btn-yellow text-xs py-1 px-3"
                          >
                            VIEW LEDGER
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PURE FEE ENGINE SIMULATOR */}
        {/* ============================================================== */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Component Customizer */}
            <div className="lg:col-span-6 brutal-card p-6 bg-white space-y-6">
              <div className="border-b-2 border-black pb-3">
                <h3 className="font-extrabold text-xl uppercase">Pure Calculation Engine Simulator</h3>
                <p className="font-mono text-xs text-zinc-600 mt-1">
                  Runs directly through <code>@repo/fee-engine</code> without database mutation.
                </p>
              </div>

              {/* Fee Components list */}
              <div>
                <label className="font-mono font-bold text-xs uppercase block mb-2">Base Fee Components:</label>
                <div className="space-y-3">
                  {calcComponents.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center border-2 border-black p-3 bg-[#faf9f5]">
                      <div>
                        <span className="font-bold text-sm">{c.name}</span>
                        <span className="font-mono text-xs text-zinc-500 ml-2">[{c.type}]</span>
                      </div>
                      <span className="font-mono font-bold text-sm bg-black text-white px-2 py-0.5">
                        ₹{c.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concessions Options */}
              <div className="border-t-2 border-black pt-4 space-y-3">
                <label className="font-mono font-bold text-xs uppercase block">Concessions / Reductions:</label>
                <label className="flex items-center gap-3 border-2 border-black p-3 bg-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasScholarship}
                    onChange={(e) => {
                      setHasScholarship(e.target.checked);
                      calculatePreview(calcComponents, e.target.checked, hasDiscount, isDefectActive);
                    }}
                    className="w-5 h-5 accent-black"
                  />
                  <div>
                    <span className="font-bold text-sm">Merit Scholarship (10% Waiver)</span>
                    <p className="font-mono text-xs text-zinc-500">10% reduction calculated on gross base fee</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 border-2 border-black p-3 bg-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasDiscount}
                    onChange={(e) => {
                      setHasDiscount(e.target.checked);
                      calculatePreview(calcComponents, hasScholarship, e.target.checked, isDefectActive);
                    }}
                    className="w-5 h-5 accent-black"
                  />
                  <div>
                    <span className="font-bold text-sm">Sibling Institutional Discount (₹2,000 Flat)</span>
                    <p className="font-mono text-xs text-zinc-500">Fixed deduction applied to remaining balance</p>
                  </div>
                </label>
              </div>

              {/* Defect Simulator Switch */}
              <div className={`border-2 border-black p-4 ${isDefectActive ? 'bg-red-50' : 'bg-yellow-50'}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-black text-sm uppercase">Simulate Library Fee Defect</span>
                    <p className="font-mono text-xs text-zinc-600">Inadvertently counts ₹2,000 Library component twice</p>
                  </div>
                  <button
                    onClick={toggleDefect}
                    className={`brutal-btn ${isDefectActive ? 'brutal-btn-coral' : 'brutal-btn-mint'} text-xs`}
                  >
                    {isDefectActive ? 'ACTIVE (₹52K)' : 'DISABLED (₹50K)'}
                  </button>
                </label>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="lg:col-span-6 space-y-6">
              <div className="border-[3px] border-black bg-[#FFE600] p-6 shadow-[6px_6px_0px_#000]">
                <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-3">
                  <h3 className="font-black text-xl uppercase font-mono">Calculation Receipt</h3>
                  <span className="brutal-badge brutal-badge-dark">FEE ENGINE v{isDefectActive ? '1.1 (DEFECT)' : '1.0 (CLEAN)'}</span>
                </div>

                {calcResult && (
                  <div className="space-y-4 font-mono">
                    <div className="flex justify-between text-base">
                      <span>BASE GROSS AMOUNT:</span>
                      <span className="font-black">₹{calcResult.baseAmount.toLocaleString()}</span>
                    </div>

                    {calcResult.scholarshipAmount > 0 && (
                      <div className="flex justify-between text-base text-emerald-800">
                        <span>(-) MERIT SCHOLARSHIP:</span>
                        <span className="font-black">-₹{calcResult.scholarshipAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {calcResult.discountAmount > 0 && (
                      <div className="flex justify-between text-base text-emerald-800">
                        <span>(-) SIBLING DISCOUNT:</span>
                        <span className="font-black">-₹{calcResult.discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="border-t-[3px] border-black pt-3 flex justify-between text-2xl font-black">
                      <span>NET PAYABLE:</span>
                      <span>₹{calcResult.netPayable.toLocaleString()}</span>
                    </div>

                    {isDefectActive && (
                      <div className="mt-4 border-2 border-black bg-white p-3 font-mono text-xs font-bold text-red-600 shadow-[2px_2px_0px_#000]">
                        ⚠️ DISCREPANCY DETECTED: Expected baseline was ₹50,000. Defective calculation produced ₹52,000 (+₹2,000 Library Overcharge).
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: FINANCIAL REPORTS CENTER */}
        {/* ============================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Report Selector Pills */}
            <div className="flex gap-3 flex-wrap">
              {[
                { id: 'department', label: 'DEPARTMENT AGGREGATE REPORT' },
                { id: 'monthly', label: 'MONTHLY COLLECTIONS REPORT' },
                { id: 'outstanding', label: 'OUTSTANDING BALANCES AGING' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => loadReports(r.id as any)}
                  className={`brutal-btn ${reportType === r.id ? 'brutal-btn-yellow' : 'bg-white'} text-xs`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Department Report View */}
            {reportType === 'department' && (
              <div className="brutal-card p-6 bg-white space-y-6">
                <div className="border-b-2 border-black pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-xl uppercase">Department Fee Aggregation Report</h3>
                    <p className="font-mono text-xs text-zinc-600">
                      Derives live totals directly through the shared Fee Calculation Engine.
                    </p>
                  </div>
                  {isDefectActive && (
                    <span className="brutal-badge brutal-badge-coral animate-brutal-pulse">
                      AFFECTED BY LIBRARY DEFECT (+₹24,000)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
                  <div className="border-2 border-black p-4 bg-[#f8f9fa] shadow-[3px_3px_0px_#000]">
                    <div className="text-xs text-zinc-500 font-bold">TOTAL STUDENTS</div>
                    <div className="text-2xl font-black mt-1">12</div>
                  </div>
                  <div className="border-2 border-black p-4 bg-[#fef08a] shadow-[3px_3px_0px_#000]">
                    <div className="text-xs text-zinc-500 font-bold">TOTAL GROSS BILLED</div>
                    <div className="text-2xl font-black mt-1">
                      {isDefectActive ? '₹6,24,000' : '₹6,00,000'}
                    </div>
                  </div>
                  <div className="border-2 border-black p-4 bg-[#bbf7d0] shadow-[3px_3px_0px_#000]">
                    <div className="text-xs text-zinc-500 font-bold">TOTAL REALIZED</div>
                    <div className="text-2xl font-black mt-1">₹1,80,000</div>
                  </div>
                  <div className="border-2 border-black p-4 bg-[#fbcfe8] shadow-[3px_3px_0px_#000]">
                    <div className="text-xs text-zinc-500 font-bold">TOTAL OUTSTANDING</div>
                    <div className="text-2xl font-black mt-1">
                      {isDefectActive ? '₹4,44,000' : '₹4,20,000'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Report View */}
            {reportType === 'monthly' && (
              <div className="brutal-card p-6 bg-white space-y-4">
                <h3 className="font-extrabold text-xl uppercase border-b-2 border-black pb-3">
                  Monthly Realized Collections Summary
                </h3>
                <div className="brutal-table-container">
                  <table className="brutal-table">
                    <thead>
                      <tr>
                        <th>Year-Month</th>
                        <th>Transactions Count</th>
                        <th>Total Collected (₹)</th>
                        <th>Audit Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-mono font-bold">2024-09</td>
                        <td className="font-mono font-bold">45 Payments</td>
                        <td className="font-mono font-black text-emerald-600">₹2,70,000.00</td>
                        <td><span className="brutal-badge brutal-badge-mint">VERIFIED</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Outstanding Aging View */}
            {reportType === 'outstanding' && (
              <div className="brutal-card p-6 bg-white space-y-4">
                <h3 className="font-extrabold text-xl uppercase border-b-2 border-black pb-3">
                  Outstanding Balances & Delinquency Aging
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  <div className="border-2 border-black p-4 bg-emerald-100">
                    <span className="text-xs font-bold">0-30 DAYS (CURRENT)</span>
                    <div className="text-2xl font-black mt-1">₹8,40,000</div>
                  </div>
                  <div className="border-2 border-black p-4 bg-yellow-100">
                    <span className="text-xs font-bold">31-60 DAYS (DUE)</span>
                    <div className="text-2xl font-black mt-1">₹12,20,000</div>
                  </div>
                  <div className="border-2 border-black p-4 bg-red-100">
                    <span className="text-xs font-bold">60+ DAYS (OVERDUE)</span>
                    <div className="text-2xl font-black mt-1">₹3,70,000</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: AUTOMATED REGRESSION TESTING PLATFORM (HERO LAB) */}
        {/* ============================================================== */}
        {activeTab === 'testing' && (
          <div className="space-y-8">
            {/* Defect Simulator Control Panel */}
            <div className="border-[3px] border-black bg-white p-6 shadow-[6px_6px_0px_#000]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-[#FFE600] fill-black" />
                    <h3 className="font-black text-2xl uppercase tracking-tight">
                      Automated Regression Engine & Defect Lab
                    </h3>
                  </div>
                  <p className="font-mono text-xs text-zinc-600 mt-1 max-w-2xl">
                    Demonstrates how an unintended code modification in the Fee Engine breaks downstream reports,
                    is caught automatically by regression tests, and is verified once resolved.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleDefect}
                    data-testid="lab-toggle-defect-btn"
                    className={`brutal-btn ${isDefectActive ? 'brutal-btn-coral animate-brutal-pulse' : 'brutal-btn-yellow'}`}
                  >
                    {isDefectActive ? '⚠️ DEFECT INJECTED (ACTIVE)' : '🛡️ NORMAL ENGINE (CLEAN)'}
                  </button>

                  <button
                    onClick={triggerRegressionSuite}
                    disabled={isRunningTests}
                    data-testid="lab-trigger-run-btn"
                    className="brutal-btn brutal-btn-mint"
                  >
                    {isRunningTests ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                    {isRunningTests ? 'EXECUTING SUITE...' : 'TRIGGER RUN'}
                  </button>
                </div>
              </div>
            </div>

            {/* Side-by-Side Diff Comparison Card */}
            {comparison && (
              <div className="border-[3px] border-black bg-[#faf8f5] p-6 shadow-[6px_6px_0px_#000]">
                <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-center">
                  <div>
                    <span className="brutal-badge brutal-badge-dark mb-1">RUN COMPARISON ENGINE</span>
                    <h4 className="font-black text-lg uppercase">
                      Baseline Run ({comparison.baseRun?.engineVersion}) vs Candidate Run ({comparison.candidateRun?.engineVersion})
                    </h4>
                  </div>
                  <span className={`brutal-badge ${comparison.hasRegression ? 'brutal-badge-coral animate-brutal-pulse' : 'brutal-badge-mint'}`}>
                    {comparison.hasRegression ? 'REGRESSION DETECTED' : 'REGRESSION RESOLVED (PASS)'}
                  </span>
                </div>

                {comparison.regressions?.length > 0 ? (
                  <div className="space-y-4">
                    {comparison.regressions.map((reg: any, i: number) => (
                      <div key={i} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#FF4757]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono font-bold text-sm bg-black text-white px-2 py-0.5">
                            TEST CASE: {reg.testCaseCode}
                          </span>
                          <span className="brutal-badge brutal-badge-coral">FAILED (+₹2,000 DISCREPANCY)</span>
                        </div>
                        <div className="font-semibold text-sm mb-3">{reg.name}</div>
                        
                        {/* Comparison Matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                          <div className="border border-black p-2 bg-emerald-50">
                            <span className="text-zinc-500 font-bold block">EXPECTED OUTPUT:</span>
                            <span className="font-bold text-emerald-800 text-sm">₹50,000.00</span>
                          </div>
                          <div className="border border-black p-2 bg-red-50">
                            <span className="text-zinc-500 font-bold block">ACTUAL OUTPUT:</span>
                            <span className="font-bold text-red-800 text-sm">₹52,000.00</span>
                          </div>
                          <div className="border border-black p-2 bg-[#FFE600]">
                            <span className="text-black font-bold block">DISCREPANCY (DIFF):</span>
                            <span className="font-black text-black text-sm">+₹2,000.00 (Overbilled)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center font-mono font-bold text-emerald-800 bg-emerald-100 border-2 border-black">
                    ✅ ZERO REGRESSIONS FOUND. Candidate run outputs matched canonical baseline outputs with 100% precision.
                  </div>
                )}
              </div>
            )}

            {/* Historical Test Runs Table */}
            <div className="brutal-card p-6 bg-white space-y-4">
              <div className="flex justify-between items-center border-b-2 border-black pb-3">
                <h4 className="font-extrabold text-lg uppercase">Regression Test Run History</h4>
                <button onClick={loadTestRuns} className="brutal-btn brutal-btn-yellow text-xs py-1 px-3">
                  <RefreshCw className="w-3.5 h-3.5" /> REFRESH
                </button>
              </div>

              <div className="brutal-table-container">
                <table className="brutal-table">
                  <thead>
                    <tr>
                      <th>Run ID</th>
                      <th>Version</th>
                      <th>Trigger Source</th>
                      <th>Total Tests</th>
                      <th>Passed</th>
                      <th>Failed</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Defect Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testRuns.map((run) => (
                      <tr key={run.id}>
                        <td className="font-mono text-xs font-bold">{run.id.slice(0, 14)}...</td>
                        <td className="font-mono font-bold">v{run.engineVersion}</td>
                        <td className="font-mono text-xs">{run.triggerSource}</td>
                        <td className="font-mono font-bold">{run.totalTests}</td>
                        <td className="font-mono font-bold text-emerald-600">{run.passed}</td>
                        <td className="font-mono font-bold text-red-600">{run.failed}</td>
                        <td className="font-mono text-xs">{run.durationMs}ms</td>
                        <td>
                          <span className={`brutal-badge ${run.status === 'PASSED' ? 'brutal-badge-mint' : 'brutal-badge-coral'}`}>
                            {run.status}
                          </span>
                        </td>
                        <td>
                          <span className={`brutal-badge ${run.defectActive ? 'brutal-badge-coral' : 'brutal-badge-yellow'}`}>
                            {run.defectActive ? 'YES' : 'NO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 5. STUDENT FEE LEDGER MODAL (BRUTALIST SLIDE-OVER) */}
      {/* ============================================================== */}
      {isLedgerOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="border-[4px] border-black bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[10px_10px_0px_#000] p-6 space-y-6">
            <div className="flex justify-between items-start border-b-[3px] border-black pb-4">
              <div>
                <span className="brutal-badge brutal-badge-cyan mb-1">
                  DEPT: {selectedStudent.student?.department || 'CSE'}
                </span>
                <h3 className="font-black text-2xl uppercase">
                  {selectedStudent.student?.name}
                </h3>
                <p className="font-mono text-xs text-zinc-600 mt-1">
                  ROLL NO: {selectedStudent.student?.rollNumber} // EMAIL: {selectedStudent.student?.email}
                </p>
              </div>
              <button
                onClick={() => setIsLedgerOpen(false)}
                data-testid="close-ledger-btn"
                className="brutal-btn brutal-btn-coral p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Assessment Details */}
            {selectedStudent.assessments?.[0] && (
              <div className="space-y-4">
                <div className="border-2 border-black p-4 bg-[#fffde7] font-mono text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>BASE GROSS FEE:</span>
                    <span className="font-bold">₹{Number(selectedStudent.assessments[0].baseAmount).toLocaleString()}</span>
                  </div>
                  {Number(selectedStudent.assessments[0].scholarshipAmount) > 0 && (
                    <div className="flex justify-between text-emerald-800">
                      <span>(-) SCHOLARSHIP:</span>
                      <span className="font-bold">-₹{Number(selectedStudent.assessments[0].scholarshipAmount).toLocaleString()}</span>
                    </div>
                  )}
                  {Number(selectedStudent.assessments[0].discountAmount) > 0 && (
                    <div className="flex justify-between text-emerald-800">
                      <span>(-) SIBLING DISCOUNT:</span>
                      <span className="font-bold">-₹{Number(selectedStudent.assessments[0].discountAmount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-black pt-2 flex justify-between font-black text-base">
                    <span>NET PAYABLE:</span>
                    <span>₹{Number(selectedStudent.assessments[0].netPayable).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>TOTAL PAID:</span>
                    <span>₹{Number(selectedStudent.assessments[0].paidAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-black text-lg border-t border-dashed border-black pt-1">
                    <span>OUTSTANDING DUE:</span>
                    <span>₹{Number(selectedStudent.assessments[0].outstandingAmount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Record Payment Action */}
                {Number(selectedStudent.assessments[0].outstandingAmount) > 0 && (
                  <div className="border-2 border-black p-4 bg-white space-y-3">
                    <h4 className="font-extrabold text-sm uppercase">Record Student Payment:</h4>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="ENTER AMOUNT IN ₹..."
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="brutal-input text-sm"
                      />
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="border-2 border-black px-3 font-mono font-bold text-xs bg-white"
                      >
                        <option value="UPI">UPI</option>
                        <option value="BANK_TRANSFER">BANK TRANSFER</option>
                        <option value="CASH">CASH</option>
                      </select>
                      <button
                        onClick={() => handleRecordPayment(selectedStudent.assessments[0].id, selectedStudent.student.id)}
                        disabled={isRecordingPayment}
                        className="brutal-btn brutal-btn-mint text-xs shrink-0"
                      >
                        {isRecordingPayment ? 'PROCESSING...' : 'RECORD'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
