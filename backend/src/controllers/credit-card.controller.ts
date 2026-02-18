import { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { AuthenticatedUser } from "../interfaces/auth";
import {
  CreateCreditCardInput,
  UpdateCreditCardInput,
} from "../interfaces/credit-card";
import { CreditCardService } from "../services/credit-card.service";

const creditCardService = new CreditCardService();

export class CreditCardController {
  async create(req: Request, res: Response) {
    const { name, limit, closingDay, dueDay } = req.body as Omit<
      CreateCreditCardInput,
      "userId"
    >;
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const data: CreateCreditCardInput = {
      name,
      limit,
      closingDay,
      dueDay,
      userId: authUser!.id,
    };

    const creditCard = await creditCardService.create(data);
    return res.status(201).json(creditCard);
  }

  async list(req: Request, res: Response) {
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const creditCards = await creditCardService.list(authUser!.id);
    return res.json(creditCards);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const creditCard = await creditCardService.getById(id, authUser!.id);

    if (!creditCard) {
      return res.status(404).json({ message: "Cartão de crédito não encontrado." });
    }

    return res.json(creditCard);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const existing = await creditCardService.getById(id, authUser!.id);
    if (!existing) {
      return res.status(404).json({ message: "Cartão de crédito não encontrado." });
    }

    const { name, limit, closingDay, dueDay } = req.body as UpdateCreditCardInput;

    try {
      const updated = await creditCardService.update(id, {
        name,
        limit,
        closingDay,
        dueDay,
      });
      return res.json(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Cartão de crédito não encontrado." });
      }
      throw error;
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const existing = await creditCardService.getById(id, authUser!.id);
    if (!existing) {
      return res.status(404).json({ message: "Cartão de crédito não encontrado." });
    }

    try {
      const deleted = await creditCardService.delete(id);
      return res.json(deleted);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Cartão de crédito não encontrado." });
      }
      throw error;
    }
  }
}

