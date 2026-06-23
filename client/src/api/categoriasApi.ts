import { apiClient } from './apiClient';

export interface Categoria {
    id: string;
    nombre: string;
    activo: boolean;
}

export async function obtenerCategorias() {
    const response = await apiClient.get<{
        ok: boolean;
        mensaje: string;
        categorias: Categoria[];
    }>('/categorias');

    return response.data;
}

export interface ObtenerInfoCategoria {
    categoria: {
        nombre: string,
        activo: boolean,
        extras:
        {
            id: string,
            valor: number,
            activo: boolean,
            nombre: string
        }[]
    }
}

export async function obtenerInfoCategoria(id:string){
    const response = await apiClient.get<{
        ok:boolean,
        mensaje: string,
        data:ObtenerInfoCategoria
    }>(`/categorias/${id}`)
    return response.data;
}

export async function crearCategoria(nombre: string) {
    const response = await apiClient.post('/categorias', { nombre });
    return response.data;
}

export async function actualizarCategoria(
    id: string,
    data: Partial<{
        nombre: string;
        activo: boolean;
    }>
) {
    const response = await apiClient.patch(`/categorias/${id}`, data);
    return response.data;
}
