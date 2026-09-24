import { prisma } from '@repo/database';

export class AcademicYearRepository {
  async findAll() {
    return prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.academicYear.findUnique({
      where: { id },
    });
  }

  async findByYearCode(yearCode: string) {
    return prisma.academicYear.findUnique({
      where: { yearCode },
    });
  }

  async findCurrent() {
    return prisma.academicYear.findFirst({
      where: { isCurrent: true },
    });
  }

  async create(data: { yearCode: string; startDate: Date; endDate: Date; isCurrent?: boolean }) {
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return prisma.academicYear.create({
      data,
    });
  }

  async setCurrent(id: string) {
    return prisma.$transaction([
      prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      }),
      prisma.academicYear.update({
        where: { id },
        data: { isCurrent: true },
      }),
    ]);
  }
}
