import { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import {
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
} from "../interfaces/recurring-transaction";
import { RecurringTransactionService } from "../services/recurring-transaction.service";
import { AuthenticatedUser } from "../interfaces/auth";

const recurringTransactionService = new RecurringTransactionService();

export class RecurringTransactionController {
  async create(req: Request, res: Response) {
    const {
      title,
      amount,
      type,
      frequency,
      startDate,
      endDate,
      active,
    } = req.body as Omit<CreateRecurringTransactionInput, "userId">;

    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const data: CreateRecurringTransactionInput = {
      title,
      amount,
      type,
      frequency,
      startDate,
      endDate,
      active,
      userId: authUser!.id,
    };

    const recurringTransaction = await recurringTransactionService.create(data);

    return res.status(201).json(recurringTransaction);
  }

  async list(_req: Request, res: Response) {
    const recurringTransactions = await recurringTransactionService.list();
    return res.json(recurringTransactions);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const recurringTransaction = await recurringTransactionService.getById(id);

    if (!recurringTransaction) {
      return res
        .status(404)
        .json({ message: "Transação recorrente não encontrada." });
    }

    return res.json(recurringTransaction);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const {
      title,
      amount,
      type,
      frequency,
      startDate,
      endDate,
      active,
    } = req.body as UpdateRecurringTransactionInput;

    try {
      const recurringTransaction = await recurringTransactionService.update(id, {
        title,
        amount,
        type,
        frequency,
        startDate,
        endDate,
        active,
      });

      return res.json(recurringTransaction);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res
          .status(404)
          .json({ message: "Transação recorrente não encontrada." });
      }

      throw error;
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    try {
      const recurringTransaction = await recurringTransactionService.delete(id);
      return res.json(recurringTransaction);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res
          .status(404)
          .json({ message: "Transação recorrente não encontrada." });
      }

      throw error;
    }
  }
}

