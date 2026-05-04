import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        usuarioId: string;
        negocioId: string;
        rol: string;
      };
    }
  }
}

export {};