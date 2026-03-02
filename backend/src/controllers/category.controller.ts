import { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { AuthenticatedUser } from "../interfaces/auth";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../interfaces/category";
import { CategoryService } from "../services/category.service";

const categoryService = new CategoryService();

export class CategoryController {
  async create(req: Request, res: Response) {
    const { name, icon, color } = req.body as Omit<
      CreateCategoryInput,
      "userId"
    >;
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const data: CreateCategoryInput = {
      name,
      icon,
      color,
      userId: authUser!.id,
    };

    const category = await categoryService.create(data);
    return res.status(201).json(category);
  }

  async list(req: Request, res: Response) {
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const categories = await categoryService.list(authUser!.id);
    return res.json(categories);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const category = await categoryService.getById(id, authUser!.id);

    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }

    return res.json(category);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const existing = await categoryService.getById(id, authUser!.id);
    if (!existing) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }

    const { name, icon, color } = req.body as UpdateCategoryInput;

    try {
      const category = await categoryService.update(id, { name, icon, color });
      return res.json(category);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Categoria não encontrada." });
      }
      throw error;
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const existing = await categoryService.getById(id, authUser!.id);
    if (!existing) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }

    try {
      const category = await categoryService.delete(id);
      return res.json(category);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Categoria não encontrada." });
      }
      throw error;
    }
  }
}
