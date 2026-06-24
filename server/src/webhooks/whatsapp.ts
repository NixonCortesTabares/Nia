import { Router } from 'express';
import { NegocioRepository } from '../infraestructure/repositories/NegocioRepository';
import { ConversacionRepository } from '../infraestructure/repositories/ConversacionRepository';
import { MensajeRepository } from '../infraestructure/repositories/MensajeRepository';
import { ClienteRepository } from '../infraestructure/repositories/ClienteRepository';
import { ProcesarMensajeEntranteUseCase } from '../application/conversaciones/ProcesarMensajeEntranteUseCase';
import { clasificarMensaje } from './MensajesPredefinidos';
import { responderMensajePredefinido } from './MensajesPredefinidos';
import { enviarMensaje } from '../agent/whatsapp';
import { verificarFirmaMeta } from './verificarFirmaMeta';
import { clienteWhatsappRateLimiter } from '../infraestructure/security/ratelimite';
import { GetMenuUseCase } from '../application/menu/GetMenuUseCase';

interface WhatsAppTextMessage {
  id: string;
  from: string;
  timestamp: string;
  type: 'text';
  text: {
    body: string;
  };
}

interface WhatsAppWebhookBody {
  object: 'whatsapp_business_account' | string;
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppTextMessage[];
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

  const signature = req.header('x-hub-signature-256');

  const firmaValida = verificarFirmaMeta(
    req.rawBody,
    signature,
    process.env.META_APP_SECRET
  );

  if (!firmaValida) {
    console.warn('Webhook rechazado: firma inválida');
    return res.sendStatus(403);
  }
  res.sendStatus(200);

  try {
    const body = req.body as WhatsAppWebhookBody;

    if (body.object !== 'whatsapp_business_account') {
      return;
    }

    const value = body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    //console.log(value);
    if (!message || message.type !== 'text') {
      return;
    }

    if (!value.metadata) {
      return;
    }

    const wamid = message.id;
    const from = message.from;
    const text = message.text.body;
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

    const mensajeEntrante = new ProcesarMensajeEntranteUseCase(
      negocioRepo,
      conversacionRepo,
      mensajeRepo,
      clienteRepo
    );

    //Busca al negocio, crea al cliente, crea la conversacion, y guarda el mensaje del cliente
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
      2500
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
