import { api } from "./api";

export type AccountType = "checking" | "savings" | "wallet";

export type Account = {
  id: string;
  name: string;
  balance: number;
  type: AccountType;
  createdAt: string;
  userId: string;
};

export async function getAccounts(): Promise<Account[]> {
  return api.getAuth<Account[]>("/accounts");
}

export async function createAccount(data: {
  name: string;
  balance?: number;
  type: AccountType;
}): Promise<Account> {
  return api.postAuth<Account>("/accounts", data);
}

export async function updateAccount(
  id: string,
  data: { name?: string; balance?: number; type?: AccountType }
): Promise<Account> {
  return api.putAuth<Account>(`/accounts/${id}`, data);
}

export async function deleteAccount(id: string): Promise<void> {
  return api.deleteAuth(`/accounts/${id}`);
}
