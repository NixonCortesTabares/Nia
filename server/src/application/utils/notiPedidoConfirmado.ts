import { enviarTemplateWhatsApp } from "../../agent/whatsappTemplate";

export async function notiPedidoConfirmado(params: {
  phoneId: string;
  numeroDestino: string | null;
}): Promise<void> {
  if (!params.numeroDestino) {
    console.warn("No se envió template pedido_confirmado: no hay numtel.");
    return;
  }

  const templateName = process.env.WS_TEMPLATE_PEDIDO_CONFIRMADO;

  if (!templateName) {
    console.warn("WS_TEMPLATE_PEDIDO_CONFIRMADO no está configurado.");
    return;
  }

  await enviarTemplateWhatsApp({
    phoneId: params.phoneId,
    to: params.numeroDestino,
    templateName,
    languageCode: process.env.WS_TEMPLATE_LANGUAGE ?? "es_CO",
  });
}