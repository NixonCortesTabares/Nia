export interface Categoria{
    id: string,
    negocioId: string,
    nombre: string,
    activo: boolean,
    creadoEn: Date,
}

export interface CrearCategoriaDTO {
    negocioId: string,
    nombre: string,
}

export interface ActualizarCategoriaDTO{
    nombre?: string,
    activo?: boolean
}