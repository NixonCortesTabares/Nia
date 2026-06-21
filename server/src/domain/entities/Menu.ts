export interface Menu {
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
