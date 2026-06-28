import { MenuProductoRow } from "../../infraestructure/repositories/ProductoRepository";

type ProductoMenuPrompt = {
  codigoMenu: number;
  productoNombre: string;
};

export function ConstruirMenuUseCase(rows: MenuProductoRow[]): string {
  const categorias = new Map<string, ProductoMenuPrompt[]>();

  for (const row of rows) {
    const categoriaNombre = row.categoriaNombre.trim();
    const productoNombre = row.productoNombre.trim();
    const codigoMenu = Number(row.codigoMenu);

    if (!categorias.has(categoriaNombre)) {
      categorias.set(categoriaNombre, []);
    }

    categorias.get(categoriaNombre)!.push({
      codigoMenu,
      productoNombre,
    });
  }

  let prompt = "MENÚ DISPONIBLE DEL NEGOCIO\n\n";

  for (const [categoriaNombre, productos] of categorias.entries()) {
    prompt += `${categoriaNombre.toUpperCase()}:\n`;

    for (const producto of productos) {
      prompt += `${producto.productoNombre}\n`;
    }

    prompt += "\n";
  }

  prompt += `
REGLAS PARA INTERPRETAR PRODUCTOS

- Usa este menú para interpretar nombres informales del cliente.
- Cuando identifiques un producto del menú, debes devolver exactamente ese nombre del producto en el JSON del pedido.
- Si el cliente pide un producto que coincide claramente con una opción del menú, usa el nombre de ese producto.
- Si hay ambigüedad real entre varios productos, pregunta cuál desea antes de elegir el nombre.
- El backend validará el nombre_producto antes de registrar el pedido.

FORMATO ESPERADO PARA CADA ITEM DEL PEDIDO

{
  "nombre_producto": string,
  "cantidad": number,
  "extras": string[],
  "notas": string | null
}
`;

  return prompt.trim();
}