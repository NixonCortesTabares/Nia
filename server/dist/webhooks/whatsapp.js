"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NegocioRepository_1 = require("../infraestructure/repositories/NegocioRepository");
const ConversacionRepository_1 = require("../infraestructure/repositories/ConversacionRepository");
const MensajeRepository_1 = require("../infraestructure/repositories/MensajeRepository");
const ClienteRepository_1 = require("../infraestructure/repositories/ClienteRepository");
const ProcesarMensajeEntranteUseCase_1 = require("../application/conversaciones/ProcesarMensajeEntranteUseCase");
const whatsapp_1 = require("../agent/whatsapp");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    console.log('ENV SECRET:', process.env.WS_WEBHOOK_SECRET);
    console.log('RECEIVED TOKEN:', req.query['hub.verify_token']);
    const mode = req.query['hub.mode'];
    const verifyToken = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' &&
        verifyToken === process.env.WS_WEBHOOK_SECRET &&
        typeof challenge === 'string') {
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
        const body = req.body;
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
        const phoneId = value.metadata.phone_number_id;
        const negocioRepo = new NegocioRepository_1.NegocioRepository();
        const conversacionRepo = new ConversacionRepository_1.ConversacionRepository();
        const mensajeRepo = new MensajeRepository_1.MensajeRepository();
        const clienteRepo = new ClienteRepository_1.ClienteRepository();
        const mensajeEntrante = new ProcesarMensajeEntranteUseCase_1.ProcesarMensajeEntranteUseCase(negocioRepo, conversacionRepo, mensajeRepo, clienteRepo);
        const resultado = await mensajeEntrante.execute({
            wamid: wamid,
            from: from,
            text: text,
            phoneId: phoneId
        });
        const wamidRta = await (0, whatsapp_1.enviarMensaje)(from, "Hola, recibimos tu mensaje, en breve seras atendido.");
        const result = await mensajeRepo.crear({
            conversacionId: resultado.conversacion.id,
            rol: 'agente',
            contenido: 'Hola, recibimos tu mensaje',
            wamid: wamidRta
        });
    }
    catch (error) {
        console.log("Error en ProcesarMensajeEntranteUseCase", error);
    }
});
exports.default = router;
