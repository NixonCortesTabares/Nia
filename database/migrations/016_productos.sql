CREATE TABLE productos (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id         UUID NOT NULL REFERENCES negocios(id),
    categoria_id      UUID NOT NULL REFERENCES categorias(id),
    nombre             VARCHAR(100),
    ingredientes       VARCHAR(100),
    descripcion        VARCHAR(300),
    valor              INTEGER, 
    activo             BOOLEAN NOT NULL DEFAULT true,
    creado_en          TIMESTAMP DEFAULT NOW()
    
);