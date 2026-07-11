export interface FotosNegocio{
    id: string;
    negocioId: string;
    linkFoto: string;
}


export interface EliminarFotosNegocioDTO{
    linkFoto: string;
    negocioId: string;
}