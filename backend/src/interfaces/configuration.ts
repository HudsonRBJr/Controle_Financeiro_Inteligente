export interface CreateConfigurationInput {
  name: string;
  description: string;
  version: string;
}

export interface UpdateConfigurationInput {
  name?: string;
  description?: string;
  version?: string;
}
