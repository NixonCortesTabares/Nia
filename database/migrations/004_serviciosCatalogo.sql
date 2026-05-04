CREATE TABLE servicios_catalogo (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id          UUID NOT NULL REFERENCES negocios(id),
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    duracion_minutos    INTEGER NOT NULL,
    precio_base         DECIMAL(10,2) NOT NULL,
    activo              BOOLEAN DEFAULT TRUE,
    creado_en           TIMESTAMP DEFAULT NOW()
);