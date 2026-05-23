ALTER TABLE conversaciones
ADD COLUMN IF NOT EXISTS respuesta_pendiente BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE conversaciones
ADD COLUMN IF NOT EXISTS procesar_despues_de TIMESTAMP NULL;

ALTER TABLE conversaciones
ADD COLUMN IF NOT EXISTS ultimo_cliente_procesado_en TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_conversaciones_respuesta_pendiente
ON conversaciones (respuesta_pendiente, procesar_despues_de)
WHERE respuesta_pendiente = true;
