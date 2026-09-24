import { StudentRepository, type StudentFilterOptions } from './student.repository.js';
import { NotFoundError, ConflictError } from '../../errors/app-error.js';
import { prisma } from '@repo/database';
import type { StudentStatus } from '@repo/types';

export class StudentService {
  constructor(private repo = new StudentRepository()) {}

  async getStudents(options: StudentFilterOptions) {
    return this.repo.findMany(options);
  }

  async getStudentById(id: string) {
    const student = await this.repo.findById(id);
    if (!student) {
      throw new NotFoundError('Student', id);
    }
    return student;
  }

  async createStudent(data: {
    rollNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    departmentId: string;
    academicYearId: string;
  }) {
    const [existingRoll, existingEmail] = await Promise.all([
      this.repo.findByRollNumber(data.rollNumber),
      this.repo.findByEmail(data.email),
    ]);

    if (existingRoll) {
      throw new ConflictError(`Student with roll number '${data.rollNumber}' already exists`);
    }
    if (existingEmail) {
      throw new ConflictError(`Student with email '${data.email}' already exists`);
    }

    // Verify department and academic year exist
    const [dept, year] = await Promise.all([
      prisma.department.findUnique({ where: { id: data.departmentId } }),
      prisma.academicYear.findUnique({ where: { id: data.academicYearId } }),
    ]);

    if (!dept) throw new NotFoundError('Department', data.departmentId);
    if (!year) throw new NotFoundError('AcademicYear', data.academicYearId);

    return this.repo.create(data);
  }

  async updateStudent(
    id: string,
    data: { firstName?: string; lastName?: string; email?: string; phone?: string; status?: StudentStatus }
  ) {
    await this.getStudentById(id);

    if (data.email) {
      const existing = await this.repo.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Email '${data.email}' is already in use`);
      }
    }

    return this.repo.update(id, data);
  }
}
