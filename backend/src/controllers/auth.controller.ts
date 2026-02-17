import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "E-mail e senha são obrigatórios." });
    }

    try {
      const result = await authService.login(email, password);

      if (!result) {
        return res.status(401).json({ message: "Credenciais inválidas." });
      }

      return res.json(result);
    } catch (error) {
      // Erros de configuração interna (por exemplo, JWT_SECRET ausente)
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erro interno na autenticação." });
    }
  }
}

