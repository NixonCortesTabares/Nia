CREATE TABLE extras(
    id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id),
    nombre VARCHAR(100),
    valor INTEGER,
    creado_en TIMESTAMP DEFAULT NOW(),
    activo BOOLEAN NOT NULL DEFAULT true

);