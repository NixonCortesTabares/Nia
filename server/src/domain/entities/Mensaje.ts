export type RolMensaje = 'cliente' | 'agente';
export type TipoMensaje = 'texto' | 'imagen' | 'documento';

export interface Mensaje {
  id: string;
  negocioId: string;
  conversacionId: string;
  rol: RolMensaje;
  contenido: string;
  wamid?: string;
  tipo: TipoMensaje;
  mediaId: string | null;
  mediaUrl: string | null;
  mimeType: string | null;
  caption: string | null;
  enviadoEn: Date;
}

export interface CrearMensajeDTO {
  conversacionId: string;
  rol: RolMensaje;
  contenido: string;
  wamid?: string;
  tipo?: TipoMensaje;
  mediaId?: string | null;
  mediaUrl?: string | null;
  mimeType?: string | null;
  caption?: string | null;
}
