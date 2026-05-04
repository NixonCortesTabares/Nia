import { Router } from 'express';
import { NegocioRepository } from '../infraestructure/repositories/NegocioRepository';
import { ConversacionRepository } from '../infraestructure/repositories/ConversacionRepository';
import { MensajeRepository } from '../infraestructure/repositories/MensajeRepository';
import { ClienteRepository } from '../infraestructure/repositories/ClienteRepository';
import { ProcesarMensajeEntranteUseCase } from '../application/conversaciones/ProcesarMensajeEntranteUseCase';
import { enviarMensaje } from '../agent/whatsapp';
import { runAgentTurn } from '../agent';

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
  console.log('ENV SECRET:', process.env.WS_WEBHOOK_SECRET);
  console.log('RECEIVED TOKEN:', req.query['hub.verify_token']);
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

    if (!message || message.type !== 'text') {
      return;
    }

    if (!value.metadata) {
      return;
    }

    const wamid = message.id;
    const from = message.from;
    const text = message.text.body;
    const phoneId = value.metadata.phone_number_id

    const negocioRepo = new NegocioRepository();
    const conversacionRepo = new ConversacionRepository();
    const mensajeRepo = new MensajeRepository();
    const clienteRepo = new ClienteRepository();

    const mensajeEntrante = new ProcesarMensajeEntranteUseCase(negocioRepo, conversacionRepo, mensajeRepo, clienteRepo)

    //Funcion que recibe el mensaje del cliente
    const resultado = await mensajeEntrante.execute({
      wamid: wamid,
      from: from,
      text: text,
      phoneId: phoneId
    });

    if (resultado.conversacion.estado === 'escalada') {
      console.log('Conversación escalada. El agente no responderá automáticamente.');
      return;
    }

    // Obtener historial de la conversación
    const historial = await mensajeRepo.buscarPorConversacion(resultado.conversacion.id);

    // Llamar al agente
    const respuesta = await runAgentTurn({
      negocio: resultado.negocio,
      cliente: resultado.cliente,
      conversacion: resultado.conversacion,
      historial,
      mensajeCliente: text
    });

    console.log("Respuesta generada por agente:", JSON.stringify(respuesta));

    // Solo responder si el agente generó texto
    if (respuesta) {
      const wamidRta = await enviarMensaje(from, respuesta);
      await mensajeRepo.crear({
        conversacionId: resultado.conversacion.id,
        rol: 'agente',
        contenido: respuesta,
        wamid: wamidRta
      });
    }

    /*const wamidRta= await enviarMensaje(from, "Hola, recibimos tu mensaje, en breve seras atendido.");
  
    const result = await mensajeRepo.crear({
      conversacionId: resultado.conversacion.id,
      rol: 'agente',
      contenido: 'Hola, recibimos tu mensaje',
      wamid: wamidRta 
    })*/
  }
  catch (error) {
    console.log("Error en ProcesarMensajeEntranteUseCase", error)
  }
});

export default router;
