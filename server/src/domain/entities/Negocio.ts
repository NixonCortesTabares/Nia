export interface Negocio {
  id: string;
  nombre: string;
  tipo: 'restaurante';
  telefonoWs?: string;
  ciudad?: string;
  direccion?: string;
  activo: boolean;
  creadoEn: Date;
  menu_link:string;
  costo_domicilio: number;
  numtel: string
  menupdf: string;
  menufoto: string;
  tipomenu: string;
}

export interface CrearNegocioDTO {
  nombre: string;
  tipo: string;
  ciudad?: string;
  direccion?: string;
}

export interface EditarNegocioDTO {
  nombre?: string;
  tipo?: 'restaurante';
  telefonoWs?: string;
  ciudad?: string;
  direccion?: string;
  costo_domicilio?:string
}
