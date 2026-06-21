type VentanaRateLimit = "5m" | "1h" | "1d";

interface ReglaRateLimit {
  ventana: VentanaRateLimit;
  windowMs: number;
  max: number;
}

interface RateLimitInput {
  phoneNumberId: string;
  telefonoCliente: string;
}

type RateLimitPermitido = {
  permitido: true;
};

type RateLimitBloqueado = {
  permitido: false;
  ventana: VentanaRateLimit;
  contador: number;
  max: number;
  retryAfterMs: number;
  motivo: string;
};

export type ResultadoRateLimitCliente =
  | RateLimitPermitido
  | RateLimitBloqueado;

interface CounterState {
  count: number;
  resetAt: number;
}

const REGLAS_RATE_LIMIT: ReglaRateLimit[] = [
  {
    ventana: "5m",
    windowMs: 5 * 60 * 1000,
    max: 20,
  },
  {
    ventana: "1h",
    windowMs: 60 * 60 * 1000,
    max: 60,
  },
  {
    ventana: "1d",
    windowMs: 24 * 60 * 60 * 1000,
    max: 150,
  },
];

export class RateLimiter {
  private counters = new Map<string, CounterState>();

  constructor() {
    const interval = setInterval(() => {
      this.limpiarContadoresExpirados();
    }, 10 * 60 * 1000);

    interval.unref?.();
  }

  verificar(input: RateLimitInput): ResultadoRateLimitCliente {
    const now = Date.now();

    for (const regla of REGLAS_RATE_LIMIT) {
      const key = this.buildKey(input, regla.ventana);
      const actual = this.counters.get(key);

      let siguiente: CounterState;

      if (!actual || actual.resetAt <= now) {
        siguiente = {
          count: 1,
          resetAt: now + regla.windowMs,
        };
      } else {
        siguiente = {
          count: actual.count + 1,
          resetAt: actual.resetAt,
        };
      }

      this.counters.set(key, siguiente);

      if (siguiente.count > regla.max) {
        return {
          permitido: false,
          ventana: regla.ventana,
          contador: siguiente.count,
          max: regla.max,
          retryAfterMs: Math.max(siguiente.resetAt - now, 0),
          motivo: `Cliente excedió el límite de ${regla.max} mensajes en ${regla.ventana}.`,
        };
      }
    }

    return {
      permitido: true,
    };
  }

  private buildKey(input: RateLimitInput, ventana: VentanaRateLimit): string {
    return `${input.phoneNumberId}:${input.telefonoCliente}:${ventana}`;
  }

  private limpiarContadoresExpirados(): void {
    const now = Date.now();

    for (const [key, value] of this.counters.entries()) {
      if (value.resetAt <= now) {
        this.counters.delete(key);
      }
    }
  }
}

export const clienteWhatsappRateLimiter =
  new RateLimiter();