import { prisma } from "../prisma/client";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "../interfaces/transaction";

const transactionSelect = {
  id: true,
  title: true,
  description: true,
  amount: true,
  type: true,
  date: true,
  createdAt: true,

  userId: true,

  categoryId: true,
  accountFromId: true,
  accountToId: true,
  creditCardId: true,
  recurringId: true,
};

export class TransactionService {
  async create(data: CreateTransactionInput) {
    return prisma.transaction.create({
      data,
      select: transactionSelect,
    });
  }

  async list(userId: string) {
    return prisma.transaction.findMany({
      where: { userId },
      select: transactionSelect,
      orderBy: { date: "desc" },
    });
  }

  async getById(id: string, userId: string) {
    return prisma.transaction.findFirst({
      where: { id, userId },
      select: transactionSelect,
    });
  }

  async update(id: string, data: UpdateTransactionInput) {
    return prisma.transaction.update({
      where: { id },
      data,
      select: transactionSelect,
    });
  }

  async delete(id: string) {
    return prisma.transaction.delete({
      where: { id },
      select: transactionSelect,
    });
  }
}