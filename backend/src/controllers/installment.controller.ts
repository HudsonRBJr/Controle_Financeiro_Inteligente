import { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import {
  CreateInstallmentInput,
  UpdateInstallmentInput,
} from "../interfaces/installment";
import { InstallmentService } from "../services/installment.service";
import { AuthenticatedUser } from "../interfaces/auth";

const installmentService = new InstallmentService();

export class InstallmentController {
  async create(req: Request, res: Response) {
    const { number, total, amount, dueDate, paid, transactionId } = req.body as CreateInstallmentInput;

    const data: CreateInstallmentInput = {
      number,
      total,
      amount,
      dueDate,
      paid,
      transactionId,
    };

    try {
      const installment = await installmentService.create(data);
      return res.status(201).json(installment);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2023"
      ) {
        return res.status(400).json({ message: "ID de transação inválido." });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        return res.status(400).json({ message: "Transação não encontrada." });
      }
      throw error;
    }
  }

  async list(req: Request, res: Response) {
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const installments = await installmentService.list(authUser!.id);
    return res.json(installments);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const installment = await installmentService.getById(id, authUser!.id);

    if (!installment) {
      return res.status(404).json({ message: "Parcela não encontrada." });
    }

    return res.json(installment);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const installment = await installmentService.getById(id, authUser!.id);

    if (!installment) {
      return res.status(404).json({ message: "Parcela não encontrada." });
    }

    const { number, total, amount, dueDate, paid } = req.body as UpdateInstallmentInput;

    try {
      const updated = await installmentService.update(id, {
        number,
        total,
        amount,
        dueDate,
        paid,
      });
      return res.json(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Parcela não encontrada." });
      }
      throw error;
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const installment = await installmentService.getById(id, authUser!.id);

    if (!installment) {
      return res.status(404).json({ message: "Parcela não encontrada." });
    }

    try {
      const deleted = await installmentService.delete(id);
      return res.json(deleted);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Parcela não encontrada." });
      }
      throw error;
    }
  }
}
