export interface CreateCreditCardInput {
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  userId: string;
}

export interface UpdateCreditCardInput {
  name?: string;
  limit?: number;
  closingDay?: number;
  dueDay?: number;
}

