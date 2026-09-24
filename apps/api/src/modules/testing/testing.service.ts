import { prisma } from '@repo/database';
import { calculateStudentFee } from '@repo/fee-engine';
import { ReportService } from '../reports/report.service.js';
import { NotFoundError } from '../../errors/app-error.js';
import type {
  TestRunDTO,
  RunComparisonDTO,
} from '@repo/types';

export class TestingService {
  private reportService = new ReportService();

  async getSuites() {
    return prisma.testSuite.findMany({
      include: {
        _count: { select: { testCases: true } },
      },
    });
  }

  async getTestCases(suiteCode?: string) {
    return prisma.testCase.findMany({
      where: suiteCode ? { suite: { code: suiteCode } } : undefined,
      include: { suite: true },
      orderBy: { code: 'asc' },
    });
  }

  async getDefectStatus() {
    const defect = await prisma.defectSimulation.findUnique({
      where: { defectKey: 'DOUBLE_LIBRARY_FEE' },
    });
    return (
      defect ?? {
        defectKey: 'DOUBLE_LIBRARY_FEE',
        name: 'Double Count Library Fee',
        description: 'Simulates library fee duplication',
        isActive: false,
      }
    );
  }

  async toggleDefect(defectKey: string, isActive: boolean) {
    return prisma.defectSimulation.upsert({
      where: { defectKey },
      create: {
        defectKey,
        name: 'Double Count Library Fee',
        description: 'Simulates library fee duplication',
        affectedComponent: 'packages/fee-engine',
        isActive,
        activatedAt: isActive ? new Date() : null,
        deactivatedAt: isActive ? null : new Date(),
      },
      update: {
        isActive,
        activatedAt: isActive ? new Date() : undefined,
        deactivatedAt: isActive ? undefined : new Date(),
      },
    });
  }

  /**
   * Automated Regression Suite Runner
   */
  async executeSuite(suiteCode = 'FULL_REGRESSION', triggerSource = 'MANUAL') {
    let suite = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        suite = await prisma.testSuite.findUnique({
          where: { code: suiteCode },
          include: { testCases: { where: { isActive: true } } },
        });
        break;
      } catch (err: any) {
        if (err.code === 'P1017' && attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        throw err;
      }
    }

    if (!suite) throw new NotFoundError('TestSuite', suiteCode);

    const defect = await prisma.defectSimulation.findUnique({
      where: { defectKey: 'DOUBLE_LIBRARY_FEE' },
    });
    const isDefectActive = Boolean(defect?.isActive);

    const startedAt = new Date();
    const results: {
      testCaseId: string;
      status: 'PASS' | 'FAIL' | 'ERROR';
      expectedVal: any;
      actualVal: any;
      difference?: any;
      errorMessage?: string;
      durationMs: number;
    }[] = [];

    for (const tc of suite.testCases) {
      const tcStart = Date.now();
      const input = tc.inputPayload as any;
      const expected = tc.expectedOutput as any;

      try {
        let actual: any;

        if (tc.targetModule === 'FEE_ENGINE') {
          // If test case has explicit defectFlags, use them; otherwise inherit active defect
          const flags = input.defectFlags ?? (isDefectActive ? { doubleCountLibraryFee: true } : undefined);
          actual = calculateStudentFee({
            ...input,
            defectFlags: flags,
          });
        } else if (tc.targetModule === 'REPORTS') {
          if (tc.code === 'TC-REP-001') {
            const cseDept = await prisma.department.findUnique({ where: { code: 'CSE' } });
            if (!cseDept) throw new Error('CSE department not found');
            const report = await this.reportService.getDepartmentFeeReport(cseDept.id);
            actual = {
              totalStudents: report.summary.totalStudents,
              totalGrossBilled: report.summary.totalGrossBilled,
            };
          } else {
            actual = { message: 'Report target executed' };
          }
        }

        // Compare expected vs actual
        let hasMismatch = false;
        const diff: Record<string, any> = {};

        for (const [key, expVal] of Object.entries(expected)) {
          // Skip defect documentation fields in test cases
          if (key === 'defectActualIfLibraryDoubled' || key === 'cleanBaseAmount' || key === 'defectiveBaseAmount') {
            continue;
          }

          const actVal = actual[key];
          if (typeof expVal === 'number' && typeof actVal === 'number') {
            if (Math.abs(expVal - actVal) > 0.01) {
              hasMismatch = true;
              diff[key] = { expected: expVal, actual: actVal, difference: actVal - expVal };
            }
          } else if (JSON.stringify(expVal) !== JSON.stringify(actVal)) {
            hasMismatch = true;
            diff[key] = { expected: expVal, actual: actVal };
          }
        }

        results.push({
          testCaseId: tc.id,
          status: hasMismatch ? 'FAIL' : 'PASS',
          expectedVal: expected,
          actualVal: actual,
          difference: hasMismatch ? diff : undefined,
          durationMs: Date.now() - tcStart,
        });
      } catch (err: any) {
        results.push({
          testCaseId: tc.id,
          status: 'ERROR',
          expectedVal: expected,
          actualVal: null,
          errorMessage: err.message,
          durationMs: Date.now() - tcStart,
        });
      }
    }

    const completedAt = new Date();
    const passed = results.filter((r) => r.status === 'PASS').length;
    const failed = results.filter((r) => r.status === 'FAIL' || r.status === 'ERROR').length;
    const durationMs = completedAt.getTime() - startedAt.getTime();
    const runStatus = failed === 0 ? 'PASSED' : 'FAILED';
    const engineVersion = isDefectActive ? '1.1' : '1.0';

    // Persist TestRun and TestResults into PostgreSQL
    const testRun = await prisma.testRun.create({
      data: {
        suiteId: suite.id,
        triggerSource,
        engineVersion,
        totalTests: results.length,
        passed,
        failed,
        skipped: 0,
        durationMs,
        status: runStatus as any,
        defectActive: isDefectActive,
        startedAt,
        completedAt,
        results: {
          create: results.map((r) => ({
            testCaseId: r.testCaseId,
            status: r.status as any,
            expectedVal: r.expectedVal,
            actualVal: r.actualVal,
            difference: r.difference,
            errorMessage: r.errorMessage,
            durationMs: r.durationMs,
          })),
        },
      },
      include: {
        suite: true,
        results: {
          include: { testCase: true },
        },
      },
    });

    return testRun;
  }

  async listRuns(limit = 20) {
    return prisma.testRun.findMany({
      take: limit,
      include: {
        suite: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getRunById(id: string) {
    const run = await prisma.testRun.findUnique({
      where: { id },
      include: {
        suite: true,
        results: {
          include: { testCase: true },
        },
      },
    });
    if (!run) throw new NotFoundError('TestRun', id);
    return run;
  }

  /**
   * Compares two test runs side-by-side to highlight regressions
   */
  async compareRuns(baseRunId: string, candidateRunId: string): Promise<RunComparisonDTO> {
    const [baseRun, candidateRun] = await Promise.all([
      this.getRunById(baseRunId),
      this.getRunById(candidateRunId),
    ]);

    const regressions = [];
    const baseResultsMap = new Map<string, any>(baseRun.results.map((r: any) => [r.testCase.code, r]));

    for (const candResult of candidateRun.results) {
      const baseResult = baseResultsMap.get(candResult.testCase.code);
      if (baseResult?.status === 'PASS' && candResult.status !== 'PASS') {
        regressions.push({
          testCaseCode: candResult.testCase.code,
          name: candResult.testCase.name,
          targetModule: candResult.testCase.targetModule,
          baseStatus: baseResult.status as any,
          candidateStatus: candResult.status as any,
          expected: candResult.expectedVal,
          actual: candResult.actualVal,
          difference: candResult.difference,
        });
      }
    }

    return {
      baseRun: {
        id: baseRun.id,
        suiteId: baseRun.suiteId,
        suiteCode: baseRun.suite.code,
        triggerSource: baseRun.triggerSource,
        engineVersion: baseRun.engineVersion,
        totalTests: baseRun.totalTests,
        passed: baseRun.passed,
        failed: baseRun.failed,
        skipped: baseRun.skipped,
        durationMs: baseRun.durationMs,
        status: baseRun.status as any,
        defectActive: baseRun.defectActive,
        startedAt: baseRun.startedAt.toISOString(),
        completedAt: baseRun.completedAt?.toISOString(),
      },
      candidateRun: {
        id: candidateRun.id,
        suiteId: candidateRun.suiteId,
        suiteCode: candidateRun.suite.code,
        triggerSource: candidateRun.triggerSource,
        engineVersion: candidateRun.engineVersion,
        totalTests: candidateRun.totalTests,
        passed: candidateRun.passed,
        failed: candidateRun.failed,
        skipped: candidateRun.skipped,
        durationMs: candidateRun.durationMs,
        status: candidateRun.status as any,
        defectActive: candidateRun.defectActive,
        startedAt: candidateRun.startedAt.toISOString(),
        completedAt: candidateRun.completedAt?.toISOString(),
      },
      hasRegression: regressions.length > 0,
      regressions,
    };
  }
}
