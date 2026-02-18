import { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { CreateExperimentInput, UpdateExperimentInput } from "../interfaces/experiment";
import { ExperimentService } from "../services/experiment.service";
import { AuthenticatedUser } from "../interfaces/auth";

const experimentService = new ExperimentService();

export class ExperimentController {
  async create(req: Request, res: Response) {
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const body = req.body as CreateExperimentInput;

    try {
      const experiment = await experimentService.create(body, authUser!.id);
      return res.status(201).json(experiment);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return res.status(409).json({ message: "Experiment com este slug já existe." });
      }
      throw error;
    }
  }

  async list(_req: Request, res: Response) {
    const experiments = await experimentService.list();
    return res.json(experiments);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const experiment = await experimentService.getById(id);
    if (!experiment) {
      return res.status(404).json({ message: "Experiment não encontrado." });
    }
    return res.json(experiment);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const body = req.body as UpdateExperimentInput;
    try {
      const experiment = await experimentService.update(id, body);
      return res.json(experiment);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Experiment não encontrado." });
      }
      throw error;
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    try {
      await experimentService.delete(id);
      return res.status(204).send();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Experiment não encontrado." });
      }
      throw error;
    }
  }

  async getOrAssignVariant(req: Request, res: Response) {
    const { id: experimentId } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const assignment = await experimentService.getOrAssignVariant(authUser!.id, experimentId);
    if (!assignment) {
      return res.status(404).json({ message: "Experiment não encontrado ou inativo." });
    }
    return res.json(assignment);
  }

  async getAssignment(req: Request, res: Response) {
    const { id: experimentId } = req.params as { id: string };
    const authUser = (req as any).user as AuthenticatedUser | undefined;
    const assignment = await experimentService.getAssignment(authUser!.id, experimentId);
    if (!assignment) {
      return res.status(404).json({ message: "Usuário não está neste experimento." });
    }
    return res.json(assignment);
  }
}
