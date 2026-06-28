export interface Producto{
    id: string,
    negocioId: string,
    categoriaId: string,
    nombre: string,
    ingredientes: string,
    descripcion: string,
    valor: number,
    activo: boolean,
    codigoMenu: number
}

export interface CrearProductoDTO{
    negocioId: string,
    categoriaId: string,
    nombre: string,
    ingredientes: string,
    descripcion: string,
    valor: number
}

export interface ActualizarProductoDTO{
    categoriaId?: string,
    nombre?: string,
    ingredientes?: string,
    descripcion?: string,
    valor?: number,
    activo?: boolean
}
