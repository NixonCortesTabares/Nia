import { Negocio, CrearNegocioDTO, EditarNegocioDTO } from '../entities/Negocio';

export interface INegocioRepository {
  crear(data: CrearNegocioDTO): Promise<Negocio>;
  buscarPorId(id: string): Promise<Negocio | null>;
  editar(id: string, data: EditarNegocioDTO): Promise<Negocio | null>;
  desactivar(id: string): Promise<Negocio | null>;
  buscarPorTelefonoWs(telefonoWs: string): Promise<Negocio | null>;
}
