import {
  GuardarMetodosPagoDTO,
  MetodosDePago,
} from "../entities/MetodosDePago";

export interface IMetodosDePagoRepository {
  obtener(negocioId: string): Promise<MetodosDePago | null>;
  guardar(negocioId: string,data: GuardarMetodosPagoDTO): Promise<MetodosDePago | null>;
}