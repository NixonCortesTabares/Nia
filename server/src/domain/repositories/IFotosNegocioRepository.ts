import { EliminarFotosNegocioDTO, FotosNegocio } from "../entities/FotosNegocio";

export interface IFotosNegocioRepository {
  eliminar(data: EliminarFotosNegocioDTO): Promise<void>;
  obtener(negocioId: string): Promise<FotosNegocio[]>;
}
