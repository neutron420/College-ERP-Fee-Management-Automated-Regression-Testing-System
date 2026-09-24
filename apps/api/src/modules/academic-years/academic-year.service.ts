import { AcademicYearRepository } from './academic-year.repository.js';
import { NotFoundError, ConflictError } from '../../errors/app-error.js';

export class AcademicYearService {
  constructor(private repo = new AcademicYearRepository()) {}

  async getAllAcademicYears() {
    return this.repo.findAll();
  }

  async getAcademicYearById(id: string) {
    const year = await this.repo.findById(id);
    if (!year) {
      throw new NotFoundError('AcademicYear', id);
    }
    return year;
  }

  async getCurrentAcademicYear() {
    const year = await this.repo.findCurrent();
    if (!year) {
      throw new NotFoundError('Current AcademicYear');
    }
    return year;
  }

  async createAcademicYear(data: { yearCode: string; startDate: Date; endDate: Date; isCurrent?: boolean }) {
    const existing = await this.repo.findByYearCode(data.yearCode);
    if (existing) {
      throw new ConflictError(`Academic Year '${data.yearCode}' already exists`);
    }
    return this.repo.create(data);
  }

  async setCurrentAcademicYear(id: string) {
    await this.getAcademicYearById(id);
    const [, updated] = await this.repo.setCurrent(id);
    return updated;
  }
}
