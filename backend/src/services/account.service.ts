import { prisma } from "../prisma/client";
import { CreateAccountInput, UpdateAccountInput } from "../interfaces/account";

const accountSelect = {
  id: true,
  name: true,
  balance: true,
  type: true,
  createdAt: true,
  userId: true,
};

export class AccountService {
  async create(data: CreateAccountInput) {
    return prisma.account.create({
      data,
      select: accountSelect,
    });
  }

  async list(userId: string) {
    return prisma.account.findMany({
      where: { userId },
      select: accountSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string, userId: string) {
    return prisma.account.findFirst({
      where: { id, userId },
      select: accountSelect,
    });
  }

  async update(id: string, data: UpdateAccountInput) {
    return prisma.account.update({
      where: { id },
      data,
      select: accountSelect,
    });
  }

  async delete(id: string) {
    return prisma.account.delete({
      where: { id },
      select: accountSelect,
    });
  }
}

