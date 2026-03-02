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

export type BudgetWithCategory = {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string;
  category: { id: string; name: string; color: string | null };
  spent: number;
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

  async listAllWithDetails(userId: string): Promise<BudgetWithCategory[]> {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      select: {
        id: true,
        amount: true,
        month: true,
        year: true,
        categoryId: true,
        category: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    const result: BudgetWithCategory[] = [];

    for (const b of budgets) {
      const startDate = new Date(b.year, b.month - 1, 1);
      const endDate = new Date(b.year, b.month, 0, 23, 59, 59);

      const spentResult = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: b.categoryId,
          type: "EXPENSE",
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });

      const spent = Number(spentResult._sum.amount ?? 0);

      result.push({
        id: b.id,
        amount: Number(b.amount),
        month: b.month,
        year: b.year,
        categoryId: b.categoryId,
        category: {
          id: b.category.id,
          name: b.category.name,
          color: b.category.color,
        },
        spent,
      });
    }

    return result;
  }

  async listByPeriod(
    userId: string,
    month: number,
    year: number
  ): Promise<BudgetWithCategory[]> {
    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      select: {
        id: true,
        amount: true,
        month: true,
        year: true,
        categoryId: true,
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result: BudgetWithCategory[] = [];

    for (const b of budgets) {
      const spentResult = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: b.categoryId,
          type: "EXPENSE",
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });

      const spent = Number(spentResult._sum.amount ?? 0);

      result.push({
        id: b.id,
        amount: Number(b.amount),
        month: b.month,
        year: b.year,
        categoryId: b.categoryId,
        category: {
          id: b.category.id,
          name: b.category.name,
          color: b.category.color,
        },
        spent,
      });
    }

    return result;
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
