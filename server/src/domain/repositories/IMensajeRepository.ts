import { Mensaje, CrearMensajeDTO } from '../entities/Mensaje';

export interface IMensajeRepository {
  crear(data: CrearMensajeDTO): Promise<Mensaje>;
  buscarPorConversacion(conversacionId: string): Promise<Mensaje[]>;
}