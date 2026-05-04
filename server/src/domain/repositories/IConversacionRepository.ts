import { Conversacion, CrearConversacionDTO, ActualizarConversacionDTO } from '../entities/Conversacion';

export interface IConversacionRepository {
  crear(data: CrearConversacionDTO): Promise<Conversacion>;
  buscarPorId(id: string): Promise<Conversacion | null>;
  buscarActiva(clienteId: string, negocioId: string): Promise<Conversacion | null>;
  actualizar(id: string, data: ActualizarConversacionDTO): Promise<Conversacion | null>;
}
