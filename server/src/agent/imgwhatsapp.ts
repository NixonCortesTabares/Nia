 export async function imgwhatsapp(params: {
  phoneId: string;
  to: string;
  imageUrl: string;
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
        type: 'image',
        image: {
          link: params.imageUrl,
          caption: params.caption,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error enviando imagen por WhatsApp: ${error}`);
  }

  return response.json();
}