export type RolMensaje = 'cliente' | 'agente';

export interface Mensaje {
  id: string;
  conversacionId: string;
  rol: RolMensaje;
  contenido: string;
  wamid?: string;
  enviadoEn: Date;
}

export interface CrearMensajeDTO {
  conversacionId: string;
  rol: RolMensaje;
  contenido: string;
  wamid?: string;
}