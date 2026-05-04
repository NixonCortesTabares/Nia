CREATE TABLE conversaciones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id      UUID NOT NULL REFERENCES negocios(id),
    cliente_id      UUID NOT NULL REFERENCES clientes(id),
    tipo            VARCHAR(30),
    estado          VARCHAR(20) DEFAULT 'activa',
    resumen         TEXT,
    iniciada_en     TIMESTAMP DEFAULT NOW(),
    cerrada_en      TIMESTAMP
);