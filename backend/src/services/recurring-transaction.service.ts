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

  async list() {
    return prisma.recurringTransaction.findMany({
      select: recurringTransactionSelect,
    });
  }

  async getById(id: string) {
    return prisma.recurringTransaction.findUnique({
      where: { id },
      select: recurringTransactionSelect,
    });
  }

  async update(id: string, data: UpdateRecurringTransactionInput) {
    const recurringTransaction = await prisma.recurringTransaction.update({
      where: { id },
      data,
      select: recurringTransactionSelect,
    });
    return recurringTransaction;
  }

  async delete(id: string) {
    return prisma.recurringTransaction.delete({
      where: { id },
      select: recurringTransactionSelect,
    });
  }
}

