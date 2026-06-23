import { apiClient } from './apiClient';

export interface MenuPublico {
  negocio: {
    nombre: string;
  };
  categorias: Array<{
    nombre: string;
    productos: Array<{
      nombre: string;
      ingredientes: string | null;
      descripcion: string | null;
      valor: number;
    }>;
    extras: Array<{
      nombre: string;
      valor: number;
    }>;
  }>;
}

export async function obtenerMenuPublico(slug: string) {
  const response = await apiClient.get<{
    ok: boolean;
    menu: MenuPublico;
  }>(`/menu/${slug}`);

  return response.data;
}