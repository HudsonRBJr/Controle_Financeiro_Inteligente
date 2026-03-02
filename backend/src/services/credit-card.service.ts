import { prisma } from "../prisma/client";
import {
  CreateCreditCardInput,
  UpdateCreditCardInput,
} from "../interfaces/credit-card";

const creditCardSelect = {
  id: true,
  name: true,
  limit: true,
  closingDay: true,
  dueDay: true,
  createdAt: true,
  userId: true,
};

export type CreditCardWithSpent = {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  spent: number;
};

function getBillingPeriod(_closingDay: number): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return { start, end };
}

export class CreditCardService {
  async listWithSpent(userId: string): Promise<CreditCardWithSpent[]> {
    const cards = await prisma.creditCard.findMany({
      where: { userId },
      select: creditCardSelect,
      orderBy: { createdAt: "desc" },
    });

    const result: CreditCardWithSpent[] = [];

    for (const card of cards) {
      const { start, end } = getBillingPeriod(card.closingDay);
      const spentResult = await prisma.transaction.aggregate({
        where: {
          userId,
          creditCardId: card.id,
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });
      const spent = Number(spentResult._sum.amount ?? 0);

      result.push({
        id: card.id,
        name: card.name,
        limit: Number(card.limit),
        closingDay: card.closingDay,
        dueDay: card.dueDay,
        spent,
      });
    }

    return result;
  }

  async create(data: CreateCreditCardInput) {
    return prisma.creditCard.create({
      data,
      select: creditCardSelect,
    });
  }

  async list(userId: string) {
    return prisma.creditCard.findMany({
      where: { userId },
      select: creditCardSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string, userId: string) {
    return prisma.creditCard.findFirst({
      where: { id, userId },
      select: creditCardSelect,
    });
  }

  async update(id: string, data: UpdateCreditCardInput) {
    return prisma.creditCard.update({
      where: { id },
      data,
      select: creditCardSelect,
    });
  }

  async delete(id: string) {
    return prisma.creditCard.delete({
      where: { id },
      select: creditCardSelect,
    });
  }
}

