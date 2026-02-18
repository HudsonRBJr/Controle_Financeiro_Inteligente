import { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { AuthenticatedUser } from "../interfaces/auth";
import { CreateAccountInput, UpdateAccountInput } from "../interfaces/account";
import { AccountService } from "../services/account.service";

const accountService = new AccountService();

export class AccountController {
  async create(req: Request, res: Response) {
    const { name, balance, type } = req.body as Omit<CreateAccountInput, "userId">;
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const data: CreateAccountInput = {
      name,
      balance,
      type,
      userId: authUser!.id,
    };

    const account = await accountService.create(data);
    return res.status(201).json(account);
  }

  async list(req: Request, res: Response) {
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const accounts = await accountService.list(authUser!.id);
    return res.json(accounts);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const account = await accountService.getById(id, authUser!.id);

    if (!account) {
      return res.status(404).json({ message: "Conta não encontrada." });
    }

    return res.json(account);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const existing = await accountService.getById(id, authUser!.id);
    if (!existing) {
      return res.status(404).json({ message: "Conta não encontrada." });
    }

    const { name, balance, type } = req.body as UpdateAccountInput;

    try {
      const updated = await accountService.update(id, { name, balance, type });
      return res.json(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Conta não encontrada." });
      }
      throw error;
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;

    const existing = await accountService.getById(id, authUser!.id);
    if (!existing) {
      return res.status(404).json({ message: "Conta não encontrada." });
    }

    try {
      const deleted = await accountService.delete(id);
      return res.json(deleted);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Conta não encontrada." });
      }
      throw error;
    }
  }
}

