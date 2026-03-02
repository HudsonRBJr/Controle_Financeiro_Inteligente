import { prisma } from "../prisma/client";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../interfaces/category";

const categorySelect = {
  id: true,
  name: true,
  icon: true,
  color: true,
  createdAt: true,
  userId: true,
};

export class CategoryService {
  async create(data: CreateCategoryInput) {
    return prisma.category.create({
      data,
      select: categorySelect,
    });
  }

  async list(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      select: categorySelect,
      orderBy: { name: "asc" },
    });
  }

  async getById(id: string, userId: string) {
    return prisma.category.findFirst({
      where: { id, userId },
      select: categorySelect,
    });
  }

  async update(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({
      where: { id },
      data,
      select: categorySelect,
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
      select: categorySelect,
    });
  }
}
