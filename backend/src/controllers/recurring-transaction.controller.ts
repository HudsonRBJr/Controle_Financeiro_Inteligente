import { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import {
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
} from "../interfaces/recurring-transaction";
import { RecurringTransactionService } from "../services/recurring-transaction.service";
import { AuthenticatedUser } from "../interfaces/auth";

const recurringTransactionService = new RecurringTransactionService();

function toISODateTime(value: string | Date | undefined | null): Date | undefined | null {
  if (value == null) return value;
  if (value instanceof Date) return value;
  const str = String(value).trim();
  if (!str) return null;
  if (str.length === 10) return new Date(str + "T12:00:00.000Z");
  return new Date(str);
}

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
      startDate: toISODateTime(startDate) as Date,
      endDate: toISODateTime(endDate ?? undefined) ?? undefined,
      active,
      userId: authUser!.id,
    };

    const recurringTransaction = await recurringTransactionService.create(data);

    return res.status(201).json(recurringTransaction);
  }

  async list(req: Request, res: Response) {
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const recurringTransactions = await recurringTransactionService.list(
      authUser!.id
    );
    return res.json(recurringTransactions);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const recurringTransaction = await recurringTransactionService.getById(
      id,
      authUser!.id
    );

    if (!recurringTransaction) {
      return res
        .status(404)
        .json({ message: "Transação recorrente não encontrada." });
    }

    return res.json(recurringTransaction);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const {
      title,
      amount,
      type,
      frequency,
      startDate,
      endDate,
      active,
    } = req.body as UpdateRecurringTransactionInput;

    const updateData: UpdateRecurringTransactionInput = {
      title,
      amount,
      type,
      frequency,
      active,
    };
    if (startDate != null) updateData.startDate = toISODateTime(startDate) as Date;
    if (endDate !== undefined) {
      updateData.endDate = endDate === null || endDate === "" ? null : (toISODateTime(endDate) as Date);
    }

    try {
      const recurringTransaction = await recurringTransactionService.update(
        id,
        authUser!.id,
        updateData
      );

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
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    try {
      const recurringTransaction = await recurringTransactionService.delete(
        id,
        authUser!.id
      );
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

