CREATE TABLE profesionales (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id      UUID NOT NULL REFERENCES negocios(id),
    nombre          VARCHAR(100) NOT NULL,
    especialidad    VARCHAR(100),
    activo          BOOLEAN DEFAULT TRUE,
    creado_en       TIMESTAMP DEFAULT NOW()
);