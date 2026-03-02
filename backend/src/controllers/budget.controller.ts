import { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import {
  CreateBudgetInput,
  UpdateBudgetInput,
} from "../interfaces/budget";
import { BudgetService } from "../services/budget.service";
import { AuthenticatedUser } from "../interfaces/auth";

const budgetService = new BudgetService();

export class BudgetController {
  async create(req: Request, res: Response) {
    const { amount, month, year, categoryId } = req.body as Omit<
      CreateBudgetInput,
      "userId"
    >;
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const data: CreateBudgetInput = {
      amount,
      month,
      year,
      categoryId,
      userId: authUser!.id,
    };

    try {
      const budget = await budgetService.create(data);
      return res.status(201).json(budget);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2023"
      ) {
        return res.status(400).json({ message: "ID de categoria inválido." });
      }
      throw error;
    }
  }

  async list(req: Request, res: Response) {
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const all = req.query.all === "true";

    if (all) {
      const budgets = await budgetService.listAllWithDetails(authUser!.id);
      return res.json(budgets);
    }

    if (month && year) {
      const budgets = await budgetService.listByPeriod(
        authUser!.id,
        month,
        year
      );
      return res.json(budgets);
    }

    const budgets = await budgetService.list(authUser!.id);
    return res.json(budgets);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const budget = await budgetService.getById(id, authUser!.id);

    if (!budget) {
      return res.status(404).json({ message: "Orçamento não encontrado." });
    }

    return res.json(budget);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const budget = await budgetService.getById(id, authUser!.id);

    if (!budget) {
      return res.status(404).json({ message: "Orçamento não encontrado." });
    }

    const { amount, month, year, categoryId } = req.body as UpdateBudgetInput;

    try {
      const updated = await budgetService.update(id, {
        amount,
        month,
        year,
        categoryId,
      });
      return res.json(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Orçamento não encontrado." });
      }
      throw error;
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const budget = await budgetService.getById(id, authUser!.id);

    if (!budget) {
      return res.status(404).json({ message: "Orçamento não encontrado." });
    }

    try {
      const deleted = await budgetService.delete(id);
      return res.json(deleted);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Orçamento não encontrado." });
      }
      throw error;
    }
  }
}
