ALTER TABLE conversaciones
ADD COLUMN ultimo_mensaje_en TIMESTAMP DEFAULT NOW();
