import { api } from "./api";

export type Installment = {
  id: string;
  number: number;
  total: number;
  amount: number;
  dueDate: string;
  paid: boolean;
  transactionId: string;
  transaction?: {
    id: string;
    title: string;
    amount: number;
  };
  createdAt: string;
};

export async function getInstallments(): Promise<Installment[]> {
  return api.getAuth<Installment[]>("/installments");
}

export async function updateInstallment(
  id: string,
  data: { paid?: boolean; dueDate?: string; amount?: number }
): Promise<Installment> {
  return api.putAuth<Installment>(`/installments/${id}`, data);
}

export async function deleteInstallment(id: string): Promise<void> {
  return api.deleteAuth(`/installments/${id}`);
}
