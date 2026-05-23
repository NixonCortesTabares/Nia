CREATE TABLE categorias(
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id      UUID NOT NULL REFERENCES negocios(id),
    nombre          VARCHAR(100),
    activo          BOOLEAN NOT NULL DEFAULT true,
    creado_en       TIMESTAMP DEFAULT NOW(),
    UNIQUE(negocio_id, nombre)
);