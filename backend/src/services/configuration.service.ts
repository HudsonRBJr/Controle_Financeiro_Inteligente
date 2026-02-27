import { prisma } from "../prisma/client";
import {
  CreateConfigurationInput,
  UpdateConfigurationInput,
} from "../interfaces/configuration";

const configurationSelect = {
  id: true,
  name: true,
  description: true,
  version: true,
  createdAt: true,
  updatedAt: true,
};

export class ConfigurationService {
  async get() {
    const config = await prisma.configuration.findFirst({
      select: configurationSelect,
    });
    return config;
  }

  async create(data: CreateConfigurationInput) {
    return prisma.configuration.create({
      data,
      select: configurationSelect,
    });
  }

  async update(data: UpdateConfigurationInput) {
    const existing = await prisma.configuration.findFirst();
    if (!existing) {
      return null;
    }
    return prisma.configuration.update({
      where: { id: existing.id },
      data,
      select: configurationSelect,
    });
  }

  async exists(): Promise<boolean> {
    const count = await prisma.configuration.count();
    return count > 0;
  }
}
