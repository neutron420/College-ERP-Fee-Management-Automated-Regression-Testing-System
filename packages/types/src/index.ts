// ============================================================
// Core Enums
// ============================================================

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';

export type ComponentType =
  | 'TUITION'
  | 'EXAMINATION'
  | 'LIBRARY'
  | 'LABORATORY'
  | 'DEVELOPMENT'
  | 'HOSTEL'
  | 'MISCELLANEOUS';

export type ReductionType = 'PERCENTAGE' | 'FIXED';

export type AssessmentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'UPI'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'DEMAND_DRAFT';

export type RefundStatus = 'REQUESTED' | 'APPROVED' | 'PROCESSED' | 'REJECTED';

export type SuiteType =
  | 'FEE_CALCULATION'
  | 'PAYMENT'
  | 'STUDENT'
  | 'REPORTS'
  | 'INTEGRATION'
  | 'FULL_REGRESSION';

export type TestRunStatus = 'RUNNING' | 'PASSED' | 'FAILED' | 'ERROR';

export type TestResultStatus = 'PASS' | 'FAIL' | 'ERROR' | 'SKIPPED';

// ============================================================
// Fee Engine Input/Output Types
// ============================================================

export interface FeeComponentInput {
  id?: string;
  type: ComponentType;
  name: string;
  amount: number;
  isOptional?: boolean;
}

export interface ReductionInput {
  id?: string;
  code: string;
  name: string;
  type: ReductionType;
  value: number; // e.g. 10 for 10% or 2000 for ₹2,000
}

export interface PaymentRecordInput {
  id?: string;
  amount: number;
  status: PaymentStatus;
  paymentDate?: string | Date;
}

export interface RefundRecordInput {
  id?: string;
  paymentId?: string;
  amount: number;
  status: RefundStatus;
}

export interface DefectFlagsInput {
  doubleCountLibraryFee?: boolean;
  ignoreDiscounts?: boolean;
  incorrectLateFineMultiplier?: boolean;
}

export interface FeeCalculationInput {
  components: FeeComponentInput[];
  scholarships?: ReductionInput[];
  discounts?: ReductionInput[];
  dueDate: string | Date;
  calculationDate?: string | Date;
  graceDays?: number;
  finePerDay?: number;
  payments?: PaymentRecordInput[];
  refunds?: RefundRecordInput[];
  defectFlags?: DefectFlagsInput;
}

export interface ComponentBreakdown {
  tuition: number;
  examination: number;
  library: number;
  laboratory: number;
  development: number;
  hostel: number;
  miscellaneous: number;
}

export interface FeeCalculationOutput {
  baseAmount: number;
  breakdown: ComponentBreakdown;
  scholarshipAmount: number;
  discountAmount: number;
  totalConcessions: number;
  lateDays: number;
  lateFineAmount: number;
  netPayable: number;
  grossPaidAmount: number;
  refundedAmount: number;
  netPaidAmount: number;
  outstandingAmount: number;
  status: AssessmentStatus;
  isDefectSimulated: boolean;
}

// ============================================================
// API Response Envelopes
// ============================================================

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

// ============================================================
// Domain DTOs
// ============================================================

export interface DepartmentDTO {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  studentCount?: number;
}

export interface AcademicYearDTO {
  id: string;
  yearCode: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDTO {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: StudentStatus;
  departmentId: string;
  academicYearId: string;
  department?: DepartmentDTO;
  academicYear?: AcademicYearDTO;
  createdAt: string;
  updatedAt: string;
}

export interface FeeStructureDTO {
  id: string;
  name: string;
  departmentId: string;
  academicYearId: string;
  dueDate: string;
  finePerDay: number;
  graceDays: number;
  department?: DepartmentDTO;
  academicYear?: AcademicYearDTO;
  components: {
    id: string;
    type: ComponentType;
    name: string;
    amount: number;
    isOptional: boolean;
  }[];
}

export interface FeeAssessmentDTO {
  id: string;
  studentId: string;
  feeStructureId: string;
  academicYearId: string;
  baseAmount: number;
  scholarshipAmount: number;
  discountAmount: number;
  lateFineAmount: number;
  netPayable: number;
  paidAmount: number;
  outstandingAmount: number;
  status: AssessmentStatus;
  assessmentDate: string;
  dueDate: string;
  student?: StudentDTO;
  feeStructure?: FeeStructureDTO;
}

export interface PaymentDTO {
  id: string;
  feeAssessmentId: string;
  studentId: string;
  transactionRef: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
  remarks?: string | null;
  student?: StudentDTO;
}

export interface RefundDTO {
  id: string;
  paymentId: string;
  feeAssessmentId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  processedAt: string;
}

// ============================================================
// Report DTOs
// ============================================================

export interface StudentFeeReportDTO {
  student: StudentDTO;
  assessment: FeeAssessmentDTO;
  components: FeeComponentInput[];
  scholarships: ReductionInput[];
  discounts: ReductionInput[];
  payments: PaymentDTO[];
  refunds: RefundDTO[];
  calculation: FeeCalculationOutput;
}

export interface DepartmentFeeReportDTO {
  department: DepartmentDTO;
  academicYear: AcademicYearDTO;
  summary: {
    totalStudents: number;
    totalGrossBilled: number;
    totalScholarships: number;
    totalDiscounts: number;
    totalLateFines: number;
    netReceivable: number;
    totalCollected: number;
    totalRefunded: number;
    netCollected: number;
    totalOutstanding: number;
    collectionPercentage: number;
  };
  studentSummaries: {
    studentId: string;
    rollNumber: string;
    name: string;
    grossBilled: number;
    concessions: number;
    fines: number;
    netPayable: number;
    paid: number;
    outstanding: number;
    status: AssessmentStatus;
  }[];
}

export interface MonthlyCollectionReportDTO {
  year: number;
  month: number;
  monthName: string;
  totalTransactions: number;
  grossCollected: number;
  totalRefunded: number;
  netCollected: number;
  methodBreakdown: Record<PaymentMethod, number>;
}

export interface OutstandingFeeReportDTO {
  totalDelinquentStudents: number;
  totalOutstandingAmount: number;
  records: {
    studentId: string;
    rollNumber: string;
    name: string;
    departmentCode: string;
    netPayable: number;
    paidAmount: number;
    outstandingAmount: number;
    dueDate: string;
    overdueDays: number;
    status: AssessmentStatus;
  }[];
}

// ============================================================
// Regression Testing DTOs
// ============================================================

export interface TestCaseDTO {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  targetModule: string;
  suiteId: string;
  inputPayload: Record<string, unknown>;
  expectedOutput: Record<string, unknown>;
  isActive: boolean;
}

export interface TestRunDTO {
  id: string;
  suiteId: string;
  suiteCode: string;
  triggerSource: string;
  engineVersion: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  status: TestRunStatus;
  defectActive: boolean;
  startedAt: string;
  completedAt?: string | null;
}

export interface TestResultDTO {
  id: string;
  testRunId: string;
  testCaseId: string;
  testCaseCode: string;
  testCaseName: string;
  status: TestResultStatus;
  expectedVal: unknown;
  actualVal: unknown;
  difference?: unknown;
  errorMessage?: string | null;
  durationMs: number;
  executedAt: string;
}

export interface RunComparisonDTO {
  baseRun: TestRunDTO;
  candidateRun: TestRunDTO;
  hasRegression: boolean;
  regressions: {
    testCaseCode: string;
    name: string;
    targetModule: string;
    baseStatus: TestResultStatus;
    candidateStatus: TestResultStatus;
    expected: unknown;
    actual: unknown;
    difference: unknown;
  }[];
}
