import { api } from "./api";

export type CreditCardItem = {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  spent?: number;
};

export type CreateCreditCardInput = {
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
};

export async function getCreditCards(): Promise<CreditCardItem[]> {
  return api.getAuth<CreditCardItem[]>("/credit-cards?details=true");
}

export async function createCreditCard(data: CreateCreditCardInput) {
  return api.postAuth("/credit-cards", data);
}

export async function updateCreditCard(
  id: string,
  data: Partial<CreateCreditCardInput>
) {
  return api.putAuth(`/credit-cards/${id}`, data);
}

export async function deleteCreditCard(id: string) {
  return api.deleteAuth(`/credit-cards/${id}`);
}
