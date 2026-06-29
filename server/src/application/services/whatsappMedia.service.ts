export async function descargarMediaWhatsApp(mediaId: string): Promise<{
  buffer: Buffer;
  mimeType: string;
}> {
  const token = process.env.META_ACCESS_TOKEN;

  if (!token) {
    throw new Error('META_ACCESS_TOKEN no está configurado.');
  }

  const version = process.env.META_API_VERSION ?? 'v21.0';
  const mediaInfoResponse = await fetch(
    `https://graph.facebook.com/${version}/${encodeURIComponent(mediaId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!mediaInfoResponse.ok) {
    console.error('Error obteniendo URL de media de WhatsApp:', mediaInfoResponse.status);
    throw new Error('No se pudo obtener la URL de la media de WhatsApp.');
  }

  const mediaInfo = await mediaInfoResponse.json() as {
    url?: string;
    mime_type?: string;
  };

  if (!mediaInfo.url) {
    throw new Error('Meta no retornó URL de media.');
  }

  const mediaResponse = await fetch(mediaInfo.url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!mediaResponse.ok) {
    console.error('Error descargando media de WhatsApp:', mediaResponse.status);
    throw new Error('No se pudo descargar la media de WhatsApp.');
  }

  return {
    buffer: Buffer.from(await mediaResponse.arrayBuffer()),
    mimeType:
      mediaInfo.mime_type ??
      mediaResponse.headers.get('content-type') ??
      'application/octet-stream',
  };
}
