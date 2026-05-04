CREATE TABLE citas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id          UUID NOT NULL REFERENCES negocios(id),
    cliente_id          UUID NOT NULL REFERENCES clientes(id),
    conversacion_id     UUID REFERENCES conversaciones(id),
    servicio_id         UUID NOT NULL REFERENCES servicios_catalogo(id),
    profesional_id      UUID REFERENCES profesionales(id),
    fecha               DATE NOT NULL,
    hora                TIME NOT NULL,
    estado              VARCHAR(20) DEFAULT 'pendiente',
    notas               TEXT,
    creado_en           TIMESTAMP DEFAULT NOW()
);