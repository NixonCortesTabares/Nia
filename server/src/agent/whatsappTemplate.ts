function normalizarTelefonoWhatsApp(numero: string): string {
  return numero.replace(/\D/g, "");
}

type EnviarTemplateWhatsAppParams = {
  phoneId: string;
  to: string;
  templateName: string;
  languageCode?: string;
};

export async function enviarTemplateWhatsApp({
  phoneId,
  to,
  templateName,
  languageCode = "es_CO",
}: EnviarTemplateWhatsAppParams): Promise<string | null> {
  const token = process.env.WS_TOKEN;

  if (!token) {
    throw new Error("WS_TOKEN no está configurado.");
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizarTelefonoWhatsApp(to),
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
        },
      }),
    }
  );

  const data = await response.json() as any;

  if (!response.ok) {
    console.error("Error enviando template WhatsApp:", {
      status: response.status,
      data,
      templateName,
      to,
    });

    throw new Error("No se pudo enviar template WhatsApp.");
  }

  return data.messages?.[0]?.id ?? null;
}