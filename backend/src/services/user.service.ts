import { prisma } from "../prisma/client";

export class UserService {
    async create(name: string, email: string) {
        return prisma.user.create({
            data: { name, email }
        });
    }

    async list() {
        return prisma.user.findMany();
    }
}
