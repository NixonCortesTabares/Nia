import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      usuarioId: string;
      negocioId: string;
      rol: string;
    };

    rawBody?: Buffer;
  }
}

export {};