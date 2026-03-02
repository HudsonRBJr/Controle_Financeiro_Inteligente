import { prisma } from "../prisma/client";
import {
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
} from "../interfaces/recurring-transaction";

const recurringTransactionSelect = {
  id: true,
  title: true,
  amount: true,
  type: true,
  frequency: true,
  startDate: true,
  endDate: true,
  active: true,
  userId: true,
};

export class RecurringTransactionService {
  async create(data: CreateRecurringTransactionInput) {
    const recurringTransaction = await prisma.recurringTransaction.create({
      data,
      select: recurringTransactionSelect,
    });
    return recurringTransaction;
  }

  async list(userId: string) {
    return prisma.recurringTransaction.findMany({
      where: { userId },
      select: recurringTransactionSelect,
      orderBy: { startDate: "desc" },
    });
  }

  async getById(id: string, userId: string) {
    return prisma.recurringTransaction.findFirst({
      where: { id, userId },
      select: recurringTransactionSelect,
    });
  }

  async update(
    id: string,
    userId: string,
    data: UpdateRecurringTransactionInput
  ) {
    await this.getById(id, userId);
    const recurringTransaction = await prisma.recurringTransaction.update({
      where: { id },
      data,
      select: recurringTransactionSelect,
    });
    return recurringTransaction;
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return prisma.recurringTransaction.delete({
      where: { id },
      select: recurringTransactionSelect,
    });
  }
}

