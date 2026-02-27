import { Request, Response } from "express";
import {
  CreateConfigurationInput,
  UpdateConfigurationInput,
} from "../interfaces/configuration";
import { ConfigurationService } from "../services/configuration.service";

const configurationService = new ConfigurationService();

export class ConfigurationController {
  async get(_req: Request, res: Response) {
    const config = await configurationService.get();
    if (!config) {
      return res.status(404).json({ message: "Configuração não encontrada." });
    }
    return res.json(config);
  }

  async create(req: Request, res: Response) {
    const exists = await configurationService.exists();
    if (exists) {
      return res
        .status(409)
        .json({ message: "Já existe uma configuração. Use PUT para atualizar." });
    }

    const { name, description, version } = req.body as CreateConfigurationInput;

    if (!name || !description || !version) {
      return res.status(400).json({
        message: "Nome, descrição e versão são obrigatórios.",
      });
    }

    const config = await configurationService.create({
      name,
      description,
      version,
    });
    return res.status(201).json(config);
  }

  async update(req: Request, res: Response) {
    const { name, description, version } = req.body as UpdateConfigurationInput;

    const config = await configurationService.update({
      name,
      description,
      version,
    });

    if (!config) {
      return res.status(404).json({ message: "Configuração não encontrada." });
    }

    return res.json(config);
  }
}
