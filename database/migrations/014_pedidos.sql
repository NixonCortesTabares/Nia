CREATE TABLE pedidos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id      UUID NOT NULL REFERENCES negocios(id),
    cliente_id      UUID NOT NULL REFERENCES clientes(id),
    conversacion_id UUID NOT NULL REFERENCES conversaciones(id),

    nombre_cliente   VARCHAR(100),
    telefono_cliente VARCHAR(20) NOT NULL,
    tipo_entrega VARCHAR(30) NOT NULL CHECK(tipo_entrega IN ('domicilio', 'recoger_en_local', 'consumo_en_local')),
    direccion_entrega VARCHAR(150),
    metodo_pago     VARCHAR(20) NOT NULL CHECK(metodo_pago IN('efectivo', 'transferencia')),
    
    costo_domicilio INTEGER,
    total           INTEGER,
    estado          VARCHAR(20) NOT NULL CHECK(estado IN('pendiente', 'en_cocina', 'en_ruta', 'entregado', 'cancelado')),
    notas           VARCHAR(300),
    creado_en       TIMESTAMP DEFAULT NOW()
);