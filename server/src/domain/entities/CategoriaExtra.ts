export interface CategoriaExtra{
    id: string,
    negocioId: string,
    categoriaId: string,
    extraId: string,
    activo: boolean,
    creadoEn: Date,
    actualizadoEn: Date
}

export interface CrearCategoriaExtra{
    negocioId: string,
    categoriaId: string,
    extraId: string,
}

export interface CrearCategoriaExtraDTO extends CrearCategoriaExtra {}

export interface ActualizarCategoriaExtra{
    activo?: boolean
}

export interface ActualizarCategoriaExtraDTO extends ActualizarCategoriaExtra {}
