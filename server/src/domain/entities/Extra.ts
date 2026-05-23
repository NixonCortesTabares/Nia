    export interface Extra{
        id: string,
        negocioId: string,
        nombre: string,
        valor: number,
        creadoEn: Date,
        activo: boolean
    }

    export interface CrearExtraDTO{
        negocioId: string,
        nombre: string,
        valor: number
    }

    export interface ActualizarExtraDTO{
        nombre?: string,
        valor?: number,
        activo?: boolean
    }
    
   