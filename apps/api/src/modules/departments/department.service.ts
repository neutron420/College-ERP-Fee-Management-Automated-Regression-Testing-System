import { DepartmentRepository } from './department.repository.js';
import { NotFoundError, ConflictError } from '../../errors/app-error.js';

export class DepartmentService {
  constructor(private repo = new DepartmentRepository()) {}

  async getAllDepartments() {
    return this.repo.findAll();
  }

  async getDepartmentById(id: string) {
    const dept = await this.repo.findById(id);
    if (!dept) {
      throw new NotFoundError('Department', id);
    }
    return dept;
  }

  async createDepartment(data: { code: string; name: string; description?: string }) {
    const existing = await this.repo.findByCode(data.code);
    if (existing) {
      throw new ConflictError(`Department with code '${data.code}' already exists`);
    }
    return this.repo.create(data);
  }

  async updateDepartment(id: string, data: { name?: string; description?: string; status?: string }) {
    await this.getDepartmentById(id);
    return this.repo.update(id, data);
  }
}
