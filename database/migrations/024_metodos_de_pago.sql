CREATE TABLE metodos_de_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL UNIQUE REFERENCES negocios(id) ON DELETE CASCADE,
  efectivo BOOLEAN NOT NULL DEFAULT true,
  nequi_num VARCHAR(80),
  bancolombia_num VARCHAR(80),
  daviplata_num VARCHAR(80),
  llave_breb VARCHAR(120),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);