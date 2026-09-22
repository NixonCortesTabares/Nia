import { Router } from 'express';
import { NegocioRepository } from '../infraestructure/repositories/NegocioRepository';
import { ConversacionRepository } from '../infraestructure/repositories/ConversacionRepository';
import { MensajeRepository } from '../infraestructure/repositories/MensajeRepository';
import { ClienteRepository } from '../infraestructure/repositories/ClienteRepository';
import { ProcesarMensajeEntranteUseCase } from '../application/conversaciones/ProcesarMensajeEntranteUseCase';
import { clasificarMensaje } from './MensajesPredefinidos';
import { responderMensajePredefinido } from './MensajesPredefinidos';
import { enviarMensaje } from '../agent/whatsapp';
//import { verificarFirmaMeta } from './verificarFirmaMeta';
import { clienteWhatsappRateLimiter } from '../infraestructure/security/ratelimite';
//import { GetMenuUseCase } from '../application/menu/GetMenuUseCase';
import { descargarMediaWhatsApp } from '../application/services/whatsappMedia.service';
import { subirBufferACloudinary } from '../application/services/cloudinaryUpload.service';
import { HorarioAtencionRepository } from '../infraestructure/repositories/HorarioAtencionRepository';
import { VerificarHorarioEnServicioUseCase } from '../application/negocios/VerificarHorarioEnServicioUseCase';

interface WhatsAppTextMessage {
  id: string;
  from: string;
  timestamp: string;
  type: 'text';
  text: {
    body: string;
  };
}

interface WhatsAppImageMessage {
  id: string;
  from: string;
  timestamp: string;
  type: 'image';
  image: {
    id: string;
    caption?: string;
    mime_type?: string;
  };
}

interface WhatsAppDocumentMessage {
  id: string;
  from: string;
  timestamp: string;
  type: 'document';
  document: {
    id: string;
    caption?: string;
    filename?: string;
    mime_type?: string;
  };
}

interface WhatsAppAudioMessage {
  id: string;
  from: string;
  timestamp: string;
  type: "audio";
  audio: {
    id: string;
    mime_type?: string;
    sha256?: string;
    voice?: boolean;
  };
}

type WhatsAppMessage =
  | WhatsAppTextMessage
  | WhatsAppImageMessage
  | WhatsAppDocumentMessage
  | WhatsAppAudioMessage;

interface WhatsAppWebhookBody {
  object: 'whatsapp_business_account' | string;
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppMessage[];
        metadata?: {
          phone_number_id: string;
          display_phone_number: string;
        };
      };
    }>;
  }>;
}

const router = Router();

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const verifyToken = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (
    mode === 'subscribe' &&
    verifyToken === process.env.WS_WEBHOOK_SECRET &&
    typeof challenge === 'string'
  ) {
    return res.status(200).type('text/plain').send(challenge);
  }

  return res.status(403).json({
    ok: false,
    message: 'Token inválido',
  });
});

router.post('/', async (req, res) => {

  res.sendStatus(200);

  try {
    const body = req.body as WhatsAppWebhookBody;

    if (body.object !== 'whatsapp_business_account') {
      return;
    }

    const value = body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    //console.log(value);
    if (!message) {
      return;
    }

    if (!value.metadata) {
      return;
    }

    const wamid = message.id;
    const from = message.from;
    const phoneId = value.metadata.phone_number_id;


    const rateLimit = clienteWhatsappRateLimiter.verificar({
      phoneNumberId: phoneId,
      telefonoCliente: from,
    });

    if (!rateLimit.permitido) {
      console.warn("Mensaje ignorado por rate limit de cliente:", {
        phoneId,
        from,
        ventana: rateLimit.ventana,
        contador: rateLimit.contador,
        max: rateLimit.max,
        retryAfterMs: rateLimit.retryAfterMs,
      });

      return;
    }

    const negocioRepo = new NegocioRepository();
    const conversacionRepo = new ConversacionRepository();
    const mensajeRepo = new MensajeRepository();
    const clienteRepo = new ClienteRepository();
    const horarioRepo = new HorarioAtencionRepository();
    const mensajeEntrante = new ProcesarMensajeEntranteUseCase(
      negocioRepo,
      conversacionRepo,
      mensajeRepo,
      clienteRepo
    );
    const negocio = await negocioRepo.buscarPorTelefonoWs(phoneId);
    const horarioEnServUseCase = new VerificarHorarioEnServicioUseCase(horarioRepo);
     if (!negocio || !negocio.activo) {
        return;
      }
      const verificarHorario = await horarioEnServUseCase.execute(negocio.id);
      console.log(verificarHorario);
      if (!verificarHorario) {
        await enviarMensaje(from, "Por el momento no tenemos servicio.", phoneId);
        return
      }
    if (message.type === 'image' || message.type === 'document') {

      const esImagen = message.type === 'image';
      const mediaId = esImagen ? message.image.id : message.document.id;
      const caption = (esImagen ? message.image.caption : message.document.caption) ?? null;
      const filename = esImagen ? null : message.document.filename ?? 'documento';
      let mediaUrl: string | null = null;
      let mimeType: string | null = null;
      let falloMedia = false;

      try {
        const media = await descargarMediaWhatsApp(mediaId);
        mimeType = media.mimeType;
        mediaUrl = await subirBufferACloudinary({
          buffer: media.buffer,
          folder: `nia/comprobantes/${negocio.id}`,
          resourceType: esImagen ? 'image' : 'auto',
        });
      } catch (error) {
        falloMedia = true;
        console.error('Error procesando media de WhatsApp:', error);
      }

      const contenido = falloMedia
        ? '[El cliente envió un archivo, pero no se pudo procesar automáticamente]'
        : caption ?? (esImagen
          ? '[Comprobante de transferencia]'
          : `[Documento recibido: ${filename}]`);

      await mensajeEntrante.execute({
        wamid,
        from,
        text: contenido,
        phoneId,
        tipo: esImagen ? 'imagen' : 'documento',
        mediaId,
        mediaUrl,
        mimeType,
        caption,
      });

      const respuesta = falloMedia
        ? 'Recibimos tu archivo, pero tuvimos un problema procesándolo. Por favor envíalo nuevamente o espera a que el restaurante te contacte.'
        : 'Recibimos tu comprobante. Gracias!.';

      try {
        await enviarMensaje(from, respuesta, phoneId);
      } catch (error) {
        console.error('Error enviando confirmación de media por WhatsApp:', error);
      }

      return;
    }

    if(message.type === 'audio'){
      await enviarMensaje(from, 'No puedo escuchar audios ahora, podrias escribirme por favor?', phoneId);
      return;
    }
    if (!('text' in message) || !message.text?.body) {
      console.log('Mensaje de WhatsApp ignorado porque no es texto, imagen ni documento:', {
        wamid,
        from,
        phoneId,
        tipo: message.type,
      });
      return;
    }

    const text = message.text.body;

    //Busca al negocio, crea al cliente, crea la conversacion, y guarda el mensaje del cliente
    if(from === null){
      console.log("No hay un from definido: ", from);
      return;
    }
    const resultado = await mensajeEntrante.execute({
      wamid,
      from,
      text,
      phoneId,
    });

    const clasificacionMensaje = clasificarMensaje(text);

    if (resultado.conversacion.estado !== "activa") {
      console.log("Conversación no activa. El agente no responde.");
      return;
    }

    if (clasificacionMensaje === 'saludo') {
      const respuestaPredefinida = responderMensajePredefinido('saludo');
      if (respuestaPredefinida !== null) {
        const wamidRta = await enviarMensaje(resultado.cliente.telefono, respuestaPredefinida, phoneId);

        await mensajeRepo.crear({
          conversacionId: resultado.conversacion.id,
          rol: "agente",
          contenido: respuestaPredefinida,
          wamid: wamidRta,
        }, resultado.negocio.id);

        return;
      }
    }

    if (clasificacionMensaje === 'despedida') {
      const respuestaPredefinida = responderMensajePredefinido('despedida');
      if (respuestaPredefinida !== null) {
        const wamidRta = await enviarMensaje(resultado.cliente.telefono, respuestaPredefinida, phoneId);

        await mensajeRepo.crear({
          conversacionId: resultado.conversacion.id,
          contenido: respuestaPredefinida,
          rol: 'agente',
          wamid: wamidRta,
        }, resultado.negocio.id);

        return;
      }
    }
    await conversacionRepo.marcarRespuestaPendiente(
      resultado.conversacion.id,
      3000
    );

    console.log(
      'Conversación marcada como pendiente:',
      resultado.conversacion.id
    );
  } catch (error) {
    console.log('Error en ProcesarMensajeEntranteUseCase', error);
  }
});

export default router;
