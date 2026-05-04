CREATE TABLE visita_servicios (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visita_id           UUID NOT NULL REFERENCES visitas(id),
    servicio_id         UUID NOT NULL REFERENCES servicios_catalogo(id),
    profesional_id      UUID REFERENCES profesionales(id),
    precio_cobrado      DECIMAL(10,2) NOT NULL,
    duracion_minutos    INTEGER NOT NULL,
    creado_en           TIMESTAMP DEFAULT NOW()
);