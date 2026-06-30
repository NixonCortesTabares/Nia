import { ActualizarHorarioAtencionDTO, CrearHorarioAtencionDTO, HorarioAtencion } from "../entities/HorarioAtencion";

export interface IHorarioAtencionRepository {
    crear(data: CrearHorarioAtencionDTO): Promise<HorarioAtencion | null>
    actualizar(negocioId: string, id:string, data: ActualizarHorarioAtencionDTO): Promise<HorarioAtencion | null>
    buscarPorNegocio(negocioId: string): Promise<HorarioAtencion[]>
    buscarPorId(id: string, negocioId: string): Promise<HorarioAtencion | null>;
    eliminar(id: string, negocioId: string): Promise<boolean>;
}