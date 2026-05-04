import { Profesional, CrearProfesionalDTO, ActualizarProfesionalDTO} from '../entities/Profesional';

export interface IProfesionalRepository {
  crear(data: CrearProfesionalDTO): Promise<Profesional>;
  buscarPorNegocio(negocioId: string): Promise<Profesional[]>;
  buscarPorId(id: string): Promise<Profesional | null>;
  actualizar(id: string, data: ActualizarProfesionalDTO): Promise<Profesional | null>;
  desactivar(id:string): Promise<Profesional | null>;
}
