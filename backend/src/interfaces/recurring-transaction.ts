import { RecurrenceFrequency, TransactionType } from "../generated/prisma/enums";

export interface CreateRecurringTransactionInput {
  title: string;
  amount: number;
  type: TransactionType;
  frequency: RecurrenceFrequency;
  startDate: string | Date;
  endDate?: string | Date | null;
  active?: boolean;
  userId: string;
}

export interface UpdateRecurringTransactionInput {
  title?: string;
  amount?: number;
  type?: TransactionType;
  frequency?: RecurrenceFrequency;
  startDate?: string | Date;
  endDate?: string | Date | null;
  active?: boolean;
}

