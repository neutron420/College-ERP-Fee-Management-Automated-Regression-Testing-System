import { prisma } from '@repo/database';

export class DepartmentRepository {
  async findAll() {
    return prisma.department.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });
  }

  async findByCode(code: string) {
    return prisma.department.findUnique({
      where: { code },
    });
  }

  async create(data: { code: string; name: string; description?: string }) {
    return prisma.department.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; description?: string; status?: string }) {
    return prisma.department.update({
      where: { id },
      data,
    });
  }
}
