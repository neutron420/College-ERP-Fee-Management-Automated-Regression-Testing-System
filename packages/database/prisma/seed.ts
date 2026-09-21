import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const departments = [
  ["CSE", "Computer Science & Engineering"],
  ["ECE", "Electronics & Communication Engineering"],
  ["EEE", "Electrical & Electronics Engineering"],
  ["CIVIL", "Civil Engineering"],
  ["MECH", "Mechanical Engineering"],
] as const;

const componentSets = {
  CSE: [
    ["TUITION", "Tuition Fee", 40000],
    ["EXAMINATION", "Examination Fee", 5000],
    ["LIBRARY", "Library Fee", 2000],
    ["LABORATORY", "Laboratory Fee", 3000],
  ],
  ECE: [
    ["TUITION", "Tuition Fee", 38000],
    ["EXAMINATION", "Examination Fee", 5000],
    ["LIBRARY", "Library Fee", 2000],
    ["LABORATORY", "Laboratory Fee", 3000],
  ],
  EEE: [
    ["TUITION", "Tuition Fee", 36000],
    ["EXAMINATION", "Examination Fee", 5000],
    ["LIBRARY", "Library Fee", 2000],
    ["LABORATORY", "Laboratory Fee", 2500],
  ],
  CIVIL: [
    ["TUITION", "Tuition Fee", 35000],
    ["EXAMINATION", "Examination Fee", 5000],
    ["LIBRARY", "Library Fee", 2000],
    ["LABORATORY", "Laboratory Fee", 2500],
  ],
  MECH: [
    ["TUITION", "Tuition Fee", 37000],
    ["EXAMINATION", "Examination Fee", 5000],
    ["LIBRARY", "Library Fee", 2000],
    ["LABORATORY", "Laboratory Fee", 3000],
  ],
} as const;

const firstNames = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Vihaan",
  "Arjun",
  "Sai",
  "Reyansh",
  "Ayaan",
  "Krishna",
  "Ishaan",
  "Ananya",
  "Diya",
  "Aadhya",
  "Myra",
  "Sara",
  "Ira",
  "Avni",
  "Kiara",
  "Riya",
  "Saanvi",
];

const lastNames = [
  "Sharma",
  "Verma",
  "Singh",
  "Patel",
  "Reddy",
  "Iyer",
  "Nair",
  "Gupta",
  "Mehta",
  "Khan",
];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function sumComponents(items: readonly (readonly [string, string, number])[]) {
  return items.reduce((sum, [, , amount]) => sum + amount, 0);
}

async function main() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.testResult.deleteMany(),
    prisma.testRun.deleteMany(),
    prisma.testCase.deleteMany(),
    prisma.testSuite.deleteMany(),
    prisma.defectSimulation.deleteMany(),
    prisma.refund.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.feeAssessment.deleteMany(),
    prisma.studentDiscount.deleteMany(),
    prisma.studentScholarship.deleteMany(),
    prisma.discount.deleteMany(),
    prisma.scholarship.deleteMany(),
    prisma.feeComponent.deleteMany(),
    prisma.feeStructure.deleteMany(),
    prisma.student.deleteMany(),
    prisma.academicYear.deleteMany(),
    prisma.department.deleteMany(),
  ]);

  const academicYear = await prisma.academicYear.create({
    data: {
      yearCode: "2024-25",
      startDate: new Date("2024-07-01T00:00:00.000Z"),
      endDate: new Date("2025-06-30T00:00:00.000Z"),
      isCurrent: true,
    },
  });

  const meritScholarship = await prisma.scholarship.create({
    data: {
      code: "MERIT10",
      name: "Merit Scholarship 10%",
      type: "PERCENTAGE",
      value: 10,
      description: "Canonical 10% scholarship used in regression vectors.",
    },
  });

  const siblingDiscount = await prisma.discount.create({
    data: {
      code: "SIBLING2000",
      name: "Sibling Discount",
      type: "FIXED",
      value: 2000,
      description: "Fixed institutional discount for sibling concession.",
    },
  });

  const fullRegressionSuite = await prisma.testSuite.create({
    data: {
      code: "FULL_REGRESSION",
      name: "Full Regression Suite",
      suiteType: "FULL_REGRESSION",
      description: "Canonical fee calculation and report regression tests.",
    },
  });

  const feeSuite = await prisma.testSuite.create({
    data: {
      code: "FEE_CALCULATION",
      name: "Fee Calculation Suite",
      suiteType: "FEE_CALCULATION",
    },
  });

  const reportSuite = await prisma.testSuite.create({
    data: {
      code: "REPORTS",
      name: "Report Regression Suite",
      suiteType: "REPORTS",
    },
  });

  const createdDepartments = new Map<string, Awaited<ReturnType<typeof prisma.department.create>>>();
  const feeStructures = new Map<string, Awaited<ReturnType<typeof prisma.feeStructure.create>>>();

  for (const [code, name] of departments) {
    const department = await prisma.department.create({
      data: {
        code,
        name,
        description: `${name} department`,
      },
    });

    createdDepartments.set(code, department);

    const structure = await prisma.feeStructure.create({
      data: {
        name: `${code} Standard Fee Structure`,
        departmentId: department.id,
        academicYearId: academicYear.id,
        dueDate: new Date("2024-09-30T00:00:00.000Z"),
        finePerDay: 50,
        graceDays: 7,
        components: {
          create: componentSets[code].map(([type, componentName, amount]) => ({
            type,
            name: componentName,
            amount,
          })),
        },
      },
    });

    feeStructures.set(code, structure);
  }

  let studentCounter = 1;

  for (const [deptCode] of departments) {
    const department = createdDepartments.get(deptCode);
    const feeStructure = feeStructures.get(deptCode);

    if (!department || !feeStructure) {
      throw new Error(`Missing seed data for ${deptCode}`);
    }

    const baseAmount = sumComponents(componentSets[deptCode]);

    for (let index = 1; index <= 12; index += 1) {
      const firstName = firstNames[(studentCounter - 1) % firstNames.length];
      const lastName = lastNames[(studentCounter - 1) % lastNames.length];
      const rollNumber = `${deptCode}-2024-${String(index).padStart(3, "0")}`;
      const email = `${rollNumber.toLowerCase()}@college.example`;
      const hasMerit = deptCode === "CSE" && index === 1;
      const hasDiscount = index % 9 === 0;
      const scholarshipAmount = hasMerit ? baseAmount * 0.1 : 0;
      const discountAmount = hasDiscount ? Math.min(2000, baseAmount - scholarshipAmount) : 0;
      const netPayable = baseAmount - scholarshipAmount - discountAmount;
      const paidAmount = index % 4 === 0 ? netPayable : index % 4 === 1 ? 0 : Math.min(30000, netPayable);
      const outstandingAmount = netPayable - paidAmount;

      const student = await prisma.student.create({
        data: {
          rollNumber,
          firstName,
          lastName,
          email,
          phone: `90000${String(studentCounter).padStart(5, "0")}`,
          departmentId: department.id,
          academicYearId: academicYear.id,
        },
      });

      if (hasMerit) {
        await prisma.studentScholarship.create({
          data: {
            studentId: student.id,
            scholarshipId: meritScholarship.id,
            academicYearId: academicYear.id,
          },
        });
      }

      if (hasDiscount) {
        await prisma.studentDiscount.create({
          data: {
            studentId: student.id,
            discountId: siblingDiscount.id,
            academicYearId: academicYear.id,
          },
        });
      }

      const assessment = await prisma.feeAssessment.create({
        data: {
          studentId: student.id,
          feeStructureId: feeStructure.id,
          academicYearId: academicYear.id,
          baseAmount,
          scholarshipAmount,
          discountAmount,
          lateFineAmount: 0,
          netPayable,
          paidAmount,
          outstandingAmount,
          status: outstandingAmount === 0 ? "PAID" : paidAmount > 0 ? "PARTIALLY_PAID" : "UNPAID",
          dueDate: feeStructure.dueDate,
        },
      });

      if (paidAmount > 0) {
        await prisma.payment.create({
          data: {
            feeAssessmentId: assessment.id,
            studentId: student.id,
            transactionRef: `TXN-${rollNumber}`,
            amount: paidAmount,
            paymentMethod: index % 2 === 0 ? "UPI" : "BANK_TRANSFER",
            status: "SUCCESS",
            paymentDate: addDays(new Date("2024-09-01T00:00:00.000Z"), index),
          },
        });
      }

      studentCounter += 1;
    }
  }

  const canonicalComponents = componentSets.CSE.map(([type, name, amount]) => ({ type, name, amount }));

  await prisma.testCase.createMany({
    data: [
      {
        suiteId: feeSuite.id,
        code: "TC-CALC-001",
        name: "Standard 4-Component Base Fee",
        targetModule: "FEE_ENGINE",
        inputPayload: { components: canonicalComponents, dueDate: "2024-09-30" },
        expectedOutput: { baseAmount: 50000, netPayable: 50000, outstandingAmount: 50000 },
      },
      {
        suiteId: feeSuite.id,
        code: "TC-CALC-002",
        name: "Percentage Scholarship 10%",
        targetModule: "FEE_ENGINE",
        inputPayload: {
          components: canonicalComponents,
          scholarships: [{ code: "MERIT10", name: "Merit Scholarship 10%", type: "PERCENTAGE", value: 10 }],
          dueDate: "2024-09-30",
        },
        expectedOutput: { baseAmount: 50000, scholarshipAmount: 5000, netPayable: 45000 },
      },
      {
        suiteId: feeSuite.id,
        code: "TC-CALC-003",
        name: "Fixed Discount",
        targetModule: "FEE_ENGINE",
        inputPayload: {
          components: canonicalComponents,
          discounts: [{ code: "SIBLING2000", name: "Sibling Discount", type: "FIXED", value: 2000 }],
          dueDate: "2024-09-30",
        },
        expectedOutput: { baseAmount: 50000, discountAmount: 2000, netPayable: 48000 },
      },
      {
        suiteId: reportSuite.id,
        code: "TC-REP-001",
        name: "CSE Department Total Billed",
        targetModule: "REPORTS",
        inputPayload: { departmentCode: "CSE", academicYear: "2024-25" },
        expectedOutput: { totalStudents: 12, totalGrossBilled: 600000, defectActualIfLibraryDoubled: 624000 },
      },
      {
        suiteId: fullRegressionSuite.id,
        code: "TC-REG-DOUBLE-LIBRARY",
        name: "Double Count Library Fee Regression Detector",
        targetModule: "FEE_ENGINE",
        inputPayload: {
          components: canonicalComponents,
          defectFlags: { doubleCountLibraryFee: true },
          dueDate: "2024-09-30",
        },
        expectedOutput: { cleanBaseAmount: 50000, defectiveBaseAmount: 52000, difference: 2000 },
      },
    ],
  });

  await prisma.defectSimulation.create({
    data: {
      defectKey: "DOUBLE_LIBRARY_FEE",
      name: "Double Count Library Fee",
      description: "Adds the LIBRARY component twice to demonstrate regression detection.",
      affectedComponent: "packages/fee-engine",
      isActive: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: "DATABASE",
      entityId: "seed",
      action: "SEED_COMPLETED",
      newState: {
        departments: departments.length,
        students: 60,
        canonicalCase: "CSE base fee 50000, library-defect fee 52000",
      },
    },
  });

  console.log("Database seeded: 5 departments, 60 students, fee structures, assessments, payments, regression cases.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
