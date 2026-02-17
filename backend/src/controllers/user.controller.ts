import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { Prisma } from "../generated/prisma/client";

const userService = new UserService();

export class UserController {
  async create(req: Request, res: Response) {
    const { name, email, password } = req.body;

    try {
      const user = await userService.create(name, email, password);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return res.status(409).json({ message: "E-mail já cadastrado." });
      }
      throw error;
    }
  }

  async list(_req: Request, res: Response) {
    const users = await userService.list();
    return res.json(users);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const user = await userService.getById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    return res.json(user);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const { name, email, password } = req.body;

    try {
      const user = await userService.update(id, { name, email, password });
      return res.json(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res.status(404).json({ message: "Usuário não encontrado." });
        }
        if (error.code === "P2002") {
          return res.status(409).json({ message: "E-mail já cadastrado." });
        }
      }
      throw error;
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    try {
      const user = await userService.delete(id);
      return res.json(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }
      throw error;
    }
  }
}
