import { PedidoBorrador } from "../../domain/entities/Conversacion";
import { AgentTurnResult } from "../../agent";
export function parseAgentStructuredResponse(
  text: string,
  pedidoBorradorFallback: PedidoBorrador
): AgentTurnResult {
  try {
    const cleaned = limpiarJsonDelModelo(text);
    const parsed = JSON.parse(cleaned) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("La respuesta del agente no es un objeto JSON.");
    }

    const data = parsed as {
      mensaje_cliente?: unknown;
      pedido_borrador?: unknown;
    };

    if (typeof data.mensaje_cliente !== "string" || !data.mensaje_cliente.trim()) {
      throw new Error("La respuesta del agente no tiene mensaje_cliente válido.");
    }

    if (!esPedidoBorradorValido(data.pedido_borrador)) {
      throw new Error("La respuesta del agente no tiene pedido_borrador válido.");
    }

    return {
      mensajeCliente: data.mensaje_cliente.trim(),
      pedidoBorrador: data.pedido_borrador,
      ok: true,
    };
  } catch (error) {
    console.error("Error parseando respuesta JSON del agente:", error);
    console.error("Texto recibido del agente:", text);

    return {
      mensajeCliente:
        "Tuve un problema procesando el pedido. ¿Podrías repetirlo de forma breve?",
      pedidoBorrador: pedidoBorradorFallback,
      ok: false,
    };
  }
}

function limpiarJsonDelModelo(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export function esPedidoBorradorValido(valor: unknown): valor is PedidoBorrador {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return false;
  }

  const borrador = valor as PedidoBorrador;

  if (
    borrador.tipo_entrega !== "domicilio" &&
    borrador.tipo_entrega !== "recoger_en_local" &&
    borrador.tipo_entrega !== "consumo_en_local"
  ) {
    return false;
  }

  if (
    borrador.metodo_pago !== null &&
    borrador.metodo_pago !== "efectivo" &&
    borrador.metodo_pago !== "transferencia"
  ) {
    return false;
  }

  if (!Array.isArray(borrador.items)) {
    return false;
  }

  for (const item of borrador.items) {
    if (!item || typeof item !== "object") return false;
    if (typeof item.nombre_producto !== "string") return false;
    if (!Number.isInteger(item.cantidad) || item.cantidad < 1) return false;
    if (!Array.isArray(item.extras)) return false;

    for (const extra of item.extras) {
      if (typeof extra !== "string") return false;
    }

    if (item.notas !== null && typeof item.notas !== "string") {
      return false;
    }
  }

  if (
    borrador.nombre_cliente !== null &&
    typeof borrador.nombre_cliente !== "string"
  ) {
    return false;
  }

  if (
    borrador.telefono_cliente !== null &&
    typeof borrador.telefono_cliente !== "string"
  ) {
    return false;
  }

  if (
    borrador.direccion_entrega !== null &&
    typeof borrador.direccion_entrega !== "string"
  ) {
    return false;
  }

  if (borrador.notas !== null && typeof borrador.notas !== "string") {
    return false;
  }

  return true;
}
