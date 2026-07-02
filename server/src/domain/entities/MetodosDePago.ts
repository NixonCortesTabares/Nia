export interface MetodosDePago{
    negocioId: string;
    efectivo: boolean;
    nequiNum: string | null;
    bancolombiaNum: string | null;
    daviplataNum: string | null;
    llaveBreb: string | null;
}

export interface GuardarMetodosPagoDTO {
  efectivo?: boolean;
  nequiNum?: string | null;
  bancolombiaNum?: string | null;
  daviplataNum?: string | null;
  llaveBreb?: string | null;
}