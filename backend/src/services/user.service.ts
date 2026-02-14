import { prisma } from "../prisma/client";

export class UserService {
    async create(name: string, email: string, password: string) {
        return prisma.user.create({
            data: { name, email, password }
        });
    }

    async list() {
        return prisma.user.findMany();
    }
}
