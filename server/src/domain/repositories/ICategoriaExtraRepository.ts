import {
  ActualizarCategoriaExtraDTO,
  CategoriaExtra,
  CrearCategoriaExtraDTO,
} from '../entities/CategoriaExtra';

export interface ICategoriaExtraRepository {
  crear(data: CrearCategoriaExtraDTO): Promise<CategoriaExtra>;
  buscarPorCategoria(negocioId: string, categoriaId: string): Promise<CategoriaExtra[]>;
  buscarPorExtra(negocioId: string, extraId: string): Promise<CategoriaExtra[]>;
  existeActiva(negocioId: string, categoriaId: string, extraId: string): Promise<boolean>;
  actualizar(
    id: string,
    negocioId: string,
    data: ActualizarCategoriaExtraDTO
  ): Promise<CategoriaExtra | null>;
  desactivar(id: string, negocioId: string): Promise<CategoriaExtra | null>;
}
