import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
  async create(req: Request, res: Response) {
    const { name, email } = req.body;

    const user = await userService.create(name, email);

    return res.status(201).json(user);
  }

  async list(req: Request, res: Response) {
    const users = await userService.list();

    return res.json(users);
  }
}
