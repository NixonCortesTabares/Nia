import { Mensaje, CrearMensajeDTO } from '../entities/Mensaje';

export interface IMensajeRepository {
  crear(data: CrearMensajeDTO, negocioId: string): Promise<Mensaje>;
  buscarPorConversacion(conversacionId: string, negocioId: string): Promise<Mensaje[]>;
  buscarUltimoMensajeCliente(conversacionId: string, negocioId: string): Promise<Mensaje | null>;
}
