export interface Cliente {
  id: string;
  negocioId: string;
  nombre?: string;
  telefono: string;
  primeraVisita?: Date;
  ultimaVisita?: Date;
  totalVisitas: number;
  activo: boolean;
  creadoEn: Date;
}

export interface CrearClienteDTO {
  negocioId: string;
  telefono: string;
  nombre?: string;
}

export interface ActualizarClienteDTO {
  nombre?: string;
  telefono?:string;
}
