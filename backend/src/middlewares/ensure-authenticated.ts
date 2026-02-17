import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedUser, JwtPayload } from "../interfaces/auth";

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não informado." });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ message: "Token malformado." });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res
      .status(500)
      .json({ message: "Configuração de autenticação inválida." });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    (req as any).user = {
      id: decoded.sub,
      email: decoded.email,
    } as AuthenticatedUser;

    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}

