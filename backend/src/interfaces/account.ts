export interface CreateAccountInput {
  name: string;
  balance?: number;
  type: string; // checking, savings, wallet
  userId: string;
}

export interface UpdateAccountInput {
  name?: string;
  balance?: number;
  type?: string;
}

