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

export class CreditCardService {
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

