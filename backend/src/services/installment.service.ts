import { prisma } from "../prisma/client";
import {
  CreateInstallmentInput,
  UpdateInstallmentInput,
} from "../interfaces/installment";

const installmentSelect = {
  id: true,
  number: true,
  total: true,
  amount: true,
  dueDate: true,
  paid: true,
  transactionId: true,
};

export class InstallmentService {
  async create(data: CreateInstallmentInput) {
    return prisma.installment.create({
      data,
      select: installmentSelect,
    });
  }

  async list(userId: string) {
    return prisma.installment.findMany({
      where: { transaction: { userId } },
      select: installmentSelect,
    });
  }

  async getById(id: string, userId: string) {
    return prisma.installment.findFirst({
      where: { id, transaction: { userId } },
      select: installmentSelect,
    });
  }

  async update(id: string, data: UpdateInstallmentInput) {
    return prisma.installment.update({
      where: { id },
      data,
      select: installmentSelect,
    });
  }

  async delete(id: string) {
    return prisma.installment.delete({
      where: { id },
      select: installmentSelect,
    });
  }
}
