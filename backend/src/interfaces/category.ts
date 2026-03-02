export interface CreateCategoryInput {
  name: string;
  icon?: string;
  color?: string;
  userId: string;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
}
