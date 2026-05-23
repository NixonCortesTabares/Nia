export interface PedidoProducto{
    id: string,
    negocioId: string,
    pedidoId: string,
    productoId: string,

    nombreProducto: string,
    cantidad: number,
    precioUnitario: number
    subtotal: number,
    notas: string | null,
    creadoEn: Date
}

export interface CrearPedidoProductoDTO{
    negocioId: string,
    pedidoId: string,
    productoId: string,

    nombreProducto: string,
    cantidad: number,
    precioUnitario: number,
    subtotal: number,
    notas?: string | null,
}

export interface ActualizarPedidosProductosDTO{
    nombreProducto?: string,
    cantidad?: number,
    precioUnitario?: number,
    subtotal?: number,
    notas?: string | null
}

/*    CREATE TABLE pedidos_productos(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pedidos_id UUID NOT NULL REFERENCES pedidos(id),
        productos_id UUID NOT NULL REFERENCES productos(id),
        negocio_id UUID NOT NULL REFERENCES negocios(id),
        
        
        nombre_producto VARCHAR(150),
        cantidad INTEGER NOT NULL DEFAULT 1,
        precio_unitario INTEGER NOT NULL,
        subtotal INTEGER NOT NULL,
        notas TEXT,
        creado_en TIMESTAMP DEFAULT NOW()   
    );*/
