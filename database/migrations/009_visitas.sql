CREATE TABLE visitas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id          UUID NOT NULL REFERENCES negocios(id),
    cliente_id          UUID NOT NULL REFERENCES clientes(id),
    cita_id             UUID REFERENCES citas(id),
    fecha               DATE NOT NULL DEFAULT CURRENT_DATE,
    hora                TIME NOT NULL DEFAULT CURRENT_TIME,
    total_cobrado       DECIMAL(10,2),
    registrado_por      UUID REFERENCES usuarios(id),
    creado_en           TIMESTAMP DEFAULT NOW()
);