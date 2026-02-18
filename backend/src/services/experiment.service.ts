import { prisma } from "../prisma/client";
import { CreateExperimentInput, UpdateExperimentInput } from "../interfaces/experiment";

const experimentSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  startDate: true,
  endDate: true,
  active: true,
  createdAt: true,
  variants: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};

export class ExperimentService {
  async create(data: CreateExperimentInput, userId: string) {
    const { variants, ...rest } = data;
    return prisma.experiment.create({
      data: {
        ...rest,
        variants: {
          create: variants,
        },
      },
      select: experimentSelect,
    });
  }

  async list() {
    return prisma.experiment.findMany({
      select: experimentSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string) {
    return prisma.experiment.findUnique({
      where: { id },
      select: experimentSelect,
    });
  }

  async getBySlug(slug: string) {
    return prisma.experiment.findUnique({
      where: { slug },
      select: experimentSelect,
    });
  }

  async update(id: string, data: UpdateExperimentInput) {
    return prisma.experiment.update({
      where: { id },
      data,
      select: experimentSelect,
    });
  }

  async delete(id: string) {
    return prisma.experiment.delete({
      where: { id },
      select: { id: true },
    });
  }

  async assignUserToVariant(userId: string, experimentId: string, variantId: string) {
    return prisma.userExperimentAssignment.upsert({
      where: {
        userId_experimentId: { userId, experimentId },
      },
      create: { userId, experimentId, variantId },
      update: { variantId },
      include: {
        variant: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async getAssignment(userId: string, experimentId: string) {
    return prisma.userExperimentAssignment.findUnique({
      where: {
        userId_experimentId: { userId, experimentId },
      },
      include: {
        variant: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async getOrAssignVariant(userId: string, experimentId: string) {
    const existing = await this.getAssignment(userId, experimentId);
    if (existing) return existing;

    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      include: { variants: true },
    });
    if (!experiment || !experiment.active || experiment.variants.length === 0)
      return null;

    const randomIndex = Math.floor(Math.random() * experiment.variants.length);
    const variant = experiment.variants[randomIndex];
    const assignment = await this.assignUserToVariant(userId, experimentId, variant.id);
    return assignment;
  }
}
