import { prisma } from "../prisma/client";
import {
  CreateBudgetInput,
  UpdateBudgetInput,
} from "../interfaces/budget";

const budgetSelect = {
  id: true,
  amount: true,
  month: true,
  year: true,
  userId: true,
  categoryId: true,
};

export class BudgetService {
  async create(data: CreateBudgetInput) {
    return prisma.budget.create({
      data,
      select: budgetSelect,
    });
  }

  async list(userId: string) {
    return prisma.budget.findMany({
      where: { userId },
      select: budgetSelect,
    });
  }

  async getById(id: string, userId: string) {
    return prisma.budget.findFirst({
      where: { id, userId },
      select: budgetSelect,
    });
  }

  async update(id: string, data: UpdateBudgetInput) {
    return prisma.budget.update({
      where: { id },
      data,
      select: budgetSelect,
    });
  }

  async delete(id: string) {
    return prisma.budget.delete({
      where: { id },
      select: budgetSelect,
    });
  }
}
