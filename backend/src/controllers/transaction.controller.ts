import { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { AuthenticatedUser } from "../interfaces/auth";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "../interfaces/transaction";
import { TransactionService } from "../services/transaction.service";

const transactionService = new TransactionService();

export class TransactionController {
  async create(req: Request, res: Response) {
    const {
      title,
      description,
      amount,
      type,
      date,
      categoryId,
      accountFromId,
      accountToId,
      creditCardId,
      recurringId,
    } = req.body as Omit<CreateTransactionInput, "userId">;

    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const data: CreateTransactionInput = {
      title,
      description,
      amount,
      type,
      date: new Date(date),
      categoryId,
      accountFromId,
      accountToId,
      creditCardId,
      recurringId,
      userId: authUser!.id,
    };

    const transaction = await transactionService.create(data);
    return res.status(201).json(transaction);
  }

  async list(req: Request, res: Response) {
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const transactions = await transactionService.list(authUser!.id);
    return res.json(transactions);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const transaction = await transactionService.getById(
      id,
      authUser!.id
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transação não encontrada." });
    }

    return res.json(transaction);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const existing = await transactionService.getById(
      id,
      authUser!.id
    );

    if (!existing) {
      return res.status(404).json({ message: "Transação não encontrada." });
    }

    const {
      title,
      description,
      amount,
      type,
      date,
      categoryId,
      accountFromId,
      accountToId,
      creditCardId,
      recurringId,
    } = req.body as UpdateTransactionInput;

    try {
      const transaction = await transactionService.update(id, {
        title,
        description,
        amount,
        type,
        date: date ? new Date(date) : undefined,
        categoryId,
        accountFromId,
        accountToId,
        creditCardId,
        recurringId,
      });

      return res.json(transaction);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Transação não encontrada." });
      }
      throw error;
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const existing = await transactionService.getById(
      id,
      authUser!.id
    );

    if (!existing) {
      return res.status(404).json({ message: "Transação não encontrada." });
    }

    try {
      const transaction = await transactionService.delete(id);
      return res.json(transaction);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Transação não encontrada." });
      }
      throw error;
    }
  }
}