CREATE TABLE negocios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          VARCHAR(100) NOT NULL,
    tipo            VARCHAR(30) NOT NULL,
    telefono_ws     VARCHAR(20) UNIQUE,
    ciudad          VARCHAR(50),
    direccion       TEXT,
    activo          BOOLEAN DEFAULT TRUE,
    creado_en       TIMESTAMP DEFAULT NOW()
);