import pool from '../../config/db';
import { IConversacionRepository } from '../../domain/repositories/IConversacionRepository';

export interface ConversacionResumen {
  id: string;
  estado: string;
  cliente: {
    nombre: string | null;
    telefono: string | null;
  };
  ultimoMensaje: string | null;
  ultimaActividadEn: Date | null;
  creadoEn: Date;
}

export interface ConversacionResumenRow {
  id: string;
  estado: string;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  ultimo_mensaje: string | null;
  ultima_actividad_en: Date | null;
  creado_en: Date;
}

export class ListarConversacionesUseCase {
  constructor(
    private conversacionRepository: IConversacionRepository
  ) {}

  async execute(negocioId: string){
   const conversaciones = await this.conversacionRepository.listarConversaciones(negocioId);

   return conversaciones;
  }
}
