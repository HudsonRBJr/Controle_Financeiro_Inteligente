import { Prisma, TransactionType } from "../generated/prisma/client";

export interface CreateTransactionInput {
  title: string;
  description?: string;
  amount: Prisma.Decimal | number;
  type: TransactionType;
  date: Date;

  userId: string;

  categoryId?: string;
  accountFromId?: string;
  accountToId?: string;
  creditCardId?: string;
  recurringId?: string;
}

export interface UpdateTransactionInput {
  title?: string;
  description?: string;
  amount?: Prisma.Decimal | number;
  type?: TransactionType;
  date?: Date;

  categoryId?: string | null;
  accountFromId?: string | null;
  accountToId?: string | null;
  creditCardId?: string | null;
  recurringId?: string | null;
}