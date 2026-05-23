CREATE TABLE pedidos_productos_extras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_producto_id UUID NOT NULL REFERENCES pedidos_productos(id),
    extra_id UUID REFERENCES extras(id),
    negocio_id UUID NOT NULL REFERENCES negocios(id),

    nombre_extra VARCHAR(160) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario INTEGER NOT NULL DEFAULT 0,
    subtotal INTEGER NOT NULL DEFAULT 0,

    creado_en TIMESTAMP DEFAULT NOW()
);