import { MenuProductoRow } from "../../infraestructure/repositories/ProductoRepository";

type ProductoMenuPrompt = {
  codigoMenu: number;
  productoNombre: string;
  valor: number;
};

function formatearPrecioCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

export function ConstruirMenuUseCase(rows: MenuProductoRow[]): string {
  const categorias = new Map<string, ProductoMenuPrompt[]>();

  for (const row of rows) {
    const categoriaNombre = row.categoriaNombre.trim();
    const productoNombre = row.productoNombre.trim();
    const codigoMenu = Number(row.codigoMenu);
    const valor = Number(row.valor);

    if (!categorias.has(categoriaNombre)) {
      categorias.set(categoriaNombre, []);
    }

    categorias.get(categoriaNombre)!.push({
      codigoMenu,
      productoNombre,
      valor,
    });
  }

  let prompt = "MENÚ DISPONIBLE DEL NEGOCIO\n\n";

  for (const [categoriaNombre, productos] of categorias.entries()) {
    prompt += `${categoriaNombre.toUpperCase()}:\n`;

    for (const producto of productos) {
      prompt += `${producto.productoNombre} - ${formatearPrecioCOP(producto.valor)}\n`;
    }

    prompt += "\n";
  }

  prompt += `
REGLAS PARA INTERPRETAR PRODUCTOS Y PRECIOS

- Usa este menú para interpretar nombres informales del cliente.
- Cuando identifiques un producto del menú, debes devolver exactamente ese nombre del producto en el JSON del pedido.
- El precio mostrado junto al producto es solo informativo para responder preguntas del cliente.
- No incluyas el precio dentro de "nombre_producto".
- Si el cliente pregunta cuánto vale un producto, responde usando el precio indicado en el menú.
- Si el cliente pregunta por el total de varios productos, puedes calcularlo usando los precios del menú y las cantidades.
- Si el pedido incluye extras, domicilio, promociones o cambios no especificados en el menú, aclara que el total final debe confirmarse con el restaurante.
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