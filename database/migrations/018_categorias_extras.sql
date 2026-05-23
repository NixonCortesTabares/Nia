CREATE TABLE categorias_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  negocio_id UUID NOT NULL REFERENCES negocios(id),

  categoria_id UUID NOT NULL REFERENCES categorias(id),
  extra_id UUID NOT NULL REFERENCES extras(id),

  activo BOOLEAN NOT NULL DEFAULT true,

  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (negocio_id, categoria_id, extra_id)
);