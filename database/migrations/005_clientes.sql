CREATE TABLE clientes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id      UUID NOT NULL REFERENCES negocios(id),
    nombre          VARCHAR(100),
    telefono        VARCHAR(20) NOT NULL,
    creado_en       TIMESTAMP DEFAULT NOW(),
    UNIQUE(negocio_id, telefono)
);