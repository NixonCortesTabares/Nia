CREATE TABLE fotos_negocio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES negocios(id),
  link_foto VARCHAR(100) NOT NULL UNIQUE
);