import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";

const userSelectWithoutPassword = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

export class UserService {
  async create(name: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: userSelectWithoutPassword,
    });
    return user;
  }

  async list() {
    return prisma.user.findMany({
      select: userSelectWithoutPassword,
    });
  }

  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelectWithoutPassword,
    });
  }

  async update(id: string, data: { name?: string; email?: string; password?: string }) {
    let updateData = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelectWithoutPassword,
    });
    return user;
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
      select: userSelectWithoutPassword,
    });
  }
}
