export interface Usuario {
  id: string;
  negocioId: string;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: 'dueno' | 'staff';
  activo: boolean;
  creadoEn: Date;
}

export interface CrearUsuarioDTO {
  negocioId: string;
  nombre: string;
  email: string;
  passwordHash: string;
  rol?: 'dueno' | 'staff';
}

export interface LoginDTO {
  email: string;
  password: string;
}
