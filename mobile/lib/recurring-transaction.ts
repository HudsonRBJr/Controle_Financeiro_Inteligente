import { api } from "./api";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type RecurringTransactionItem = {
  id: string;
  title: string;
  amount: number | string;
  type: TransactionType;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate: string | null;
  active: boolean;
};

export type CreateRecurringTransactionInput = {
  title: string;
  amount: number;
  type: TransactionType;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string | null;
  active?: boolean;
};

export type UpdateRecurringTransactionInput = Partial<CreateRecurringTransactionInput>;

export async function getRecurringTransactions(): Promise<
  RecurringTransactionItem[]
> {
  return api.getAuth<RecurringTransactionItem[]>(
    "/recurring-transactions"
  );
}

export async function createRecurringTransaction(
  data: CreateRecurringTransactionInput
) {
  return api.postAuth("/recurring-transactions", data);
}

export async function updateRecurringTransaction(
  id: string,
  data: UpdateRecurringTransactionInput
) {
  return api.putAuth(`/recurring-transactions/${id}`, data);
}

export async function deleteRecurringTransaction(id: string) {
  return api.deleteAuth(`/recurring-transactions/${id}`);
}
