interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: {
      [key: string]: {
        type: string;
        description: string;
      };
    };
    required: string[];
  };
}

export const tools: Tool[] = [
  {
    name: 'consultar_servicios', /////
    description:
      'Obtiene la lista de servicios y precios registrados en el negocio. Úsala cuando el cliente pregunte por servicios, precios o cuando quiera agendar un servicio específico que todavía no ha sido validado.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'consultar_disponibilidad', ////
    description:
     'Consulta horarios disponibles para una fecha específica. Úsala solo cuando el cliente quiera revisar disponibilidad y ya esté claro el servicio que desea o el cliente solo esté preguntando por horarios generales. No la uses si el cliente pidió un servicio específico que todavía no ha sido validado con consultar_servicios.',
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
    name: 'escalar_conversacion', /////
    description:
      'Escala la conversación a un humano. Úsala inmediatamente cuando el cliente solicite devolución de dinero, use lenguaje agresivo, haga quejas o reclamos, o pida servicios no disponibles.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'consultar_citas_cliente', ////6666
    description:
      'Obtiene las citas activas (pendiente o confirmada) del cliente actual. Úsala cuando el cliente quiera cancelar, reagendar o consultar sus citas existentes. No necesita parámetros porque el sistema identifica al cliente automáticamente.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'agendar_cita', ////
    description:
      'Agenda una nueva cita para el cliente. Úsala solo cuando tengas confirmados: el servicio (validado previamente con consultar_servicios), la fecha en formato YYYY-MM-DD, la hora en formato HH:MM, y el nombre del cliente.',
    input_schema: {
      type: 'object',
      properties: {
        nombre_servicio: {
          type: 'string',
          description: 'Nombre exacto del servicio a agendar, obtenido de consultar_servicios',
        },
        fecha: {
          type: 'string',
          description: 'Fecha en formato YYYY-MM-DD',
        },
        hora: {
          type: 'string',
          description: 'Hora en formato HH:MM, ejemplo: 10:00',
        },
        nombre_cliente: {
          type: 'string',
          description: 'Nombre del cliente para la cita',
        },
      },
      required: ['servicio_id', 'fecha', 'hora', 'nombre_cliente'],
    },
  },
  {
    name: 'cancelar_cita',  ////
    description:
      'Cancela una cita existente. Úsala cuando el cliente confirme qué cita quiere cancelar. Si el cliente solo tiene una cita activa, cancélala directamente sin pedir confirmación de cuál.',
    input_schema: {
      type: 'object',
      properties: {
        cita_id: {
          type: 'string',
          description: 'ID de la cita a cancelar, obtenido de consultar_citas_cliente',
        },
      },
      required: ['cita_id'],
    },
  },
  {
    name: 'reagendar_cita',   ////
    description:
      'Cambia la fecha y hora de una cita existente. Úsala cuando el cliente confirme qué cita reagendar y haya dado la nueva fecha y hora. Si el cliente solo tiene una cita activa, reagenda esa directamente.',
    input_schema: {
      type: 'object',
      properties: {
        cita_id: {
          type: 'string',
          description: 'ID de la cita a reagendar, obtenido de consultar_citas_cliente',
        },
        nueva_fecha: {
          type: 'string',
          description: 'Nueva fecha en formato YYYY-MM-DD',
        },
        nueva_hora: {
          type: 'string',
          description: 'Nueva hora en formato HH:MM',
        },
      },
      required: ['cita_id', 'nueva_fecha', 'nueva_hora'],
    },
  },
];
