import { api } from "./api";

export type BudgetItem = {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string;
  category: { id: string; name: string; color: string | null };
  spent: number;
};

export type CreateBudgetInput = {
  amount: number;
  month: number;
  year: number;
  categoryId: string;
};

export async function getBudgetsByPeriod(
  month: number,
  year: number
): Promise<BudgetItem[]> {
  return api.getAuth<BudgetItem[]>(
    `/budgets?month=${month}&year=${year}`
  );
}

export async function getAllBudgets(): Promise<BudgetItem[]> {
  return api.getAuth<BudgetItem[]>("/budgets?all=true");
}

export async function createBudget(data: CreateBudgetInput) {
  return api.postAuth("/budgets", data);
}

export async function updateBudget(id: string, data: Partial<CreateBudgetInput>) {
  return api.putAuth(`/budgets/${id}`, data);
}

export async function deleteBudget(id: string) {
  return api.deleteAuth(`/budgets/${id}`);
}
