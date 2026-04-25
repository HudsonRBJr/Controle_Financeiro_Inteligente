import { api } from "./api";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export type Transaction = {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  type: TransactionType;
  date: string;
  createdAt: string;
  userId: string;
  categoryId: string | null;
  category: { id: string; name: string; color: string | null } | null;
  accountFromId: string | null;
  accountToId: string | null;
  creditCardId: string | null;
  recurringId: string | null;
};

export type CreateTransactionInput = {
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId?: string;
  accountFromId?: string;
  accountToId?: string;
  creditCardId?: string;
};

export async function getTransactions(): Promise<Transaction[]> {
  return api.getAuth<Transaction[]>("/transactions");
}

export async function getTransactionById(id: string): Promise<Transaction> {
  return api.getAuth<Transaction>(`/transactions/${id}`);
}

export async function createTransaction(data: CreateTransactionInput): Promise<Transaction> {
  return api.postAuth<Transaction>("/transactions", data);
}

export async function updateTransaction(
  id: string,
  data: Partial<CreateTransactionInput>
): Promise<Transaction> {
  return api.putAuth<Transaction>(`/transactions/${id}`, data);
}

export async function deleteTransaction(id: string): Promise<void> {
  return api.deleteAuth(`/transactions/${id}`);
}
