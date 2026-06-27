export async function pdfwhatsapp(params: {
  phoneId: string;
  to: string;
  documentUrl: string;
  filename: string;
  caption?: string;
}) {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${params.phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: params.to,
        type: 'document',
        document: {
          link: params.documentUrl,
          filename: params.filename,
          caption: params.caption,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error enviando documento por WhatsApp: ${error}`);
  }

  return response.json();
}