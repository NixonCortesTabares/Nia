ALTER TABLE conversaciones
ADD COLUMN pedido_borrador JSONB NOT NULL DEFAULT '{
  "nombre_cliente": null,
  "telefono_cliente": null,
  "tipo_entrega": "domicilio",
  "direccion_entrega": null,
  "metodo_pago": null,
  "items": [],
  "notas": null
}'::jsonb;