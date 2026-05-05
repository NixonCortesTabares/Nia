import { Cliente, CrearClienteDTO, ActualizarClienteDTO } from '../entities/Cliente';

export interface IClienteRepository {
  crear(data: CrearClienteDTO): Promise<Cliente>;
  actualizar(id:string, data: ActualizarClienteDTO): Promise<Cliente | null>;
  buscarPorTelefono(negocioId: string, telefono: string): Promise<Cliente | null>;
  buscarPorId(id: string): Promise<Cliente | null>;
  buscarEnRiesgo(negocioId: string): Promise<Cliente[]>;
  buscarInactivosDesdeFecha(negocioId: string, desde: Date): Promise<Cliente[]>;
  actualizarUltimaVisita(id: string): Promise<void>;
}
