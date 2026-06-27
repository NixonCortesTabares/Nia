import { Conversacion, CrearConversacionDTO, ActualizarConversacionDTO, PedidoBorradorItem } from '../entities/Conversacion';
import { PedidoBorrador } from '../entities/Conversacion';

export interface IConversacionRepository {
  crear(data: CrearConversacionDTO): Promise<Conversacion>;
  buscarPorId(id: string): Promise<Conversacion | null>;
  buscarActivaYEscalada(clienteId: string, negocioId: string): Promise<Conversacion | null>;
  actualizar(id: string, data: ActualizarConversacionDTO): Promise<Conversacion | null>;
  marcarRespuestaPendiente(conversacionId: string, delayMs: number): Promise<void>;
  buscarPendientesParaAgente(limit?: number): Promise<Conversacion[]>;
  limpiarRespuestaPendiente(conversacionId: string): Promise<void>;
  marcarProcesadaHasta(conversacionId: string, ultimoClienteProcesadoEn: Date): Promise<void>;
  marcarProcesadaHastaMensaje(
    conversacionId: string,
    mensajeClienteId: string
  ): Promise<void>;
  actualizarPedidoBorrador(conversacionId:string, pedidoBorrador: PedidoBorrador):Promise<Conversacion | null>;
  obtenerPedidoBorrador(conversacionId:string):Promise<PedidoBorrador | null>;
  actualizarItemsPedidoBorrador(conversacionId: string,items: PedidoBorradorItem[]): Promise<PedidoBorrador | null>;
  cerrarConversaciones():Promise<void>;
}
