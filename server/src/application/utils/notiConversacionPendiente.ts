import { enviarTemplateWhatsApp } from "../../agent/whatsappTemplate";

export async function notiConversacionPendiente(params: {
  phoneId: string;
  numeroDestino: string | null;
}): Promise<void> {
  if (!params.numeroDestino) {
    console.warn("No se envió template conversacion_pendiente: no hay numtel.");
    return;
  }

  const templateName = process.env.WS_TEMPLATE_CONVERSACION_PENDIENTE;

  if (!templateName) {
    console.warn("WS_TEMPLATE_CONVERSACION_PENDIENTE no está configurado.");
    return;
  }

  await enviarTemplateWhatsApp({
    phoneId: params.phoneId,
    to: params.numeroDestino,
    templateName,
    languageCode: process.env.WS_TEMPLATE_LANGUAGE ?? "es_CO",
  });
}