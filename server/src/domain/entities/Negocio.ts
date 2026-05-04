export interface Negocio {
  id: string;
  nombre: string;
  tipo: 'barberia' | 'salon' | 'spa' | 'manicure' | 'peluqueria';
  telefonoWs?: string;
  ciudad?: string;
  direccion?: string;
  activo: boolean;
  creadoEn: Date;
}

export interface CrearNegocioDTO {
  nombre: string;
  tipo: string;
  ciudad?: string;
  direccion?: string;
}

export interface EditarNegocioDTO {
  nombre?: string;
  tipo?: 'barberia' | 'salon' | 'spa' | 'manicure' | 'peluqueria';
  telefonoWs?: string;
  ciudad?: string;
  direccion?: string;
}
