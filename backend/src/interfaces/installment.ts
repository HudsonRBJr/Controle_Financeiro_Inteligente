export interface CreateInstallmentInput {
  number: number;
  total: number;
  amount: number;
  dueDate: string | Date;
  paid?: boolean;
  transactionId: string;
}

export interface UpdateInstallmentInput {
  number?: number;
  total?: number;
  amount?: number;
  dueDate?: string | Date;
  paid?: boolean;
}
