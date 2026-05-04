"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tools = void 0;
exports.tools = [
    {
        name: 'consultar_servicios',
        description: 'Obtiene la lista de servicios, precios y duraciones disponibles en el negocio. Úsala cuando el cliente pregunte por servicios, precios o cuánto tarda algo.',
        input_schema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'consultar_disponibilidad',
        description: 'Consulta qué horarios están disponibles para agendar una cita en una fecha específica. Úsala cuando el cliente quiera saber cuándo puede venir.',
        input_schema: {
            type: 'object',
            properties: {
                fecha: {
                    type: 'string',
                    description: 'Fecha en formato YYYY-MM-DD, ejemplo: 2026-05-15',
                },
            },
            required: ['fecha'],
        },
    },
    {
        name: 'escalar_conversacion',
        description: 'Escala la conversación a un humano. Úsala inmediatamente cuando el cliente solicite devolución de dinero, use lenguaje agresivo, haga quejas o reclamos, o pida servicios no disponibles.',
        input_schema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
];
