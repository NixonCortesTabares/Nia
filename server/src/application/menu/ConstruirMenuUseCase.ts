import { MenuProductoRow } from "../../infraestructure/repositories/ProductoRepository";

export function ConstruirMenuUseCase(rows: MenuProductoRow[]): string {
  const categorias = new Map<string, string[]>();

  for (const row of rows) {
    const categoria = row.categoriaNombre.trim();
    const producto = row.productoNombre.trim();

    if (!categorias.has(categoria)) {
      categorias.set(categoria, []);
    }

    categorias.get(categoria)!.push(producto);
  }

  let prompt = "MENÚ DISPONIBLE DEL NEGOCIO\n\n";

  for (const [categoria, productos] of categorias.entries()) {
    prompt += `${categoria.toUpperCase()}:\n`;

    for (const producto of productos) {
      prompt += `- ${producto}\n`;
    }

    prompt += "\n";
  }

  prompt += `
REGLAS PARA INTERPRETAR PRODUCTOS

- Usa este menú para interpretar nombres informales del cliente.
- Si el cliente escribe una abreviación clara, relaciónala con el producto más probable del menú.
- Ejemplo: "la 4000", "hamburguesa 4k" o "la 4k" pueden referirse a una hamburguesa del menú que contenga 4000.
- No confirmes productos usando nombres incompletos como "la 4000" si puedes asociarlos a un nombre oficial del menú.
- Si hay ambigüedad real entre varios productos, pregunta cuál desea.
- El backend validará el producto final antes de registrar el pedido.
`;

  return prompt.trim();
}