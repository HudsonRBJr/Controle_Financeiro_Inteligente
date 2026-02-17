export interface CreateBudgetInput {
  amount: number;
  month: number;
  year: number;
  userId: string;
  categoryId: string;
}

export interface UpdateBudgetInput {
  amount?: number;
  month?: number;
  year?: number;
  categoryId?: string;
}
