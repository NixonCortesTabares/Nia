import { Producto } from "../../domain/entities/Producto";
import { IProductoRepository } from "../../domain/repositories/IProductoRepository";

export class BuscarProdPorIdUseCase {
  constructor(private prodRepo: IProductoRepository) {}

  async execute(productoId: string, negocioId: string): Promise<Producto> {

    const result = await this.prodRepo.buscarPorId(productoId, negocioId);

    if(result === null){
        throw new Error('Error, no se pudo encontrar el producto');
    }

    return result;
  }
}
