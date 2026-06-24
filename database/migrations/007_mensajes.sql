CREATE TABLE mensajes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversacion_id     UUID NOT NULL REFERENCES conversaciones(id),
    rol                 VARCHAR(10) NOT NULL,
    contenido           TEXT NOT NULL,
    enviado_en          TIMESTAMP DEFAULT NOW(),
    negocio_id          UUID
);