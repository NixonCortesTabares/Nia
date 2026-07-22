import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  usuarioId: string;
  negocioId: string;
  rol: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({ ok: false, message: 'No autorizado' });
  }

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ ok: false, message: 'No autorizado' });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(401).json({ ok: false, message: 'No autorizado' });
  }

  try {
    const decoded: JwtPayload = jwt.verify(token, jwtSecret) as JwtPayload;

    req.user = {
      usuarioId: decoded.usuarioId,
      negocioId: decoded.negocioId,
      rol: decoded.rol,
    };

    next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: 'No autorizado' });
  }
};
