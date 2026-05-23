interface ToolProperty {
  type: string | string[];
  description?: string;
  enum?: string[];
  minimum?: number;
  items?: ToolProperty;
  properties?: { [key: string]: ToolProperty };
  required?: string[];
}

interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: { [key: string]: ToolProperty };
    required: string[];
  };
}

export const tools: Tool[] = [
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
  name: "generar_pedido",
  description:
    "Genera un pedido para un local de comida cuando el cliente ya confirmó explícitamente el pedido. El backend valida productos, extras, precios, domicilio y total. No usar esta herramienta si faltan datos o si el cliente aún no ha confirmado.",
  input_schema: {
    type: "object",
    properties: {
      nombre_cliente: {
        type: "string",
        description: "Nombre del cliente que realiza el pedido."
      },
      telefono_cliente: {
        type: "string",
        description:
          "Teléfono del cliente. Si el teléfono ya viene del contexto de WhatsApp, usar ese valor."
      },
      tipo_entrega: {
        type: "string",
        enum: ["domicilio", "recoger_en_local", "consumo_en_local"],
        description:
          "Tipo de entrega del pedido. Usar domicilio si se debe enviar a una dirección, recoger_en_local si el cliente recoge en el local, o consumo_en_local si aplica."
      },
      direccion_entrega: {
        type: "string",
        description:
          "Dirección de entrega. Es obligatoria solo cuando tipo_entrega es domicilio."
      },
      metodo_pago: {
        type: "string",
        enum: ["efectivo", "transferencia"],
        description:
          "Método de pago elegido por el cliente."
      },
      items: {
        type: "array",
        description:
          "Lista de productos solicitados por el cliente. Si el mismo producto tiene configuraciones diferentes, se debe enviar como items separados.",
        items: {
          type: "object",
          properties: {
            nombre_producto: {
              type: "string",
              description:
                "Nombre del producto pedido, tal como lo indicó el cliente."
            },
            cantidad: {
              type: "integer",
              minimum: 1,
              description:
                "Cantidad del producto solicitado."
            },
            extras: {
              type: "array",
              description:
                "Lista de extras solicitados para este producto específico. Si no tiene extras, enviar arreglo vacío.",
              items: {
                type: "string"
              }
            },
            notas: {
              type: ["string", "null"],
              description:
                "Notas o modificaciones del producto, por ejemplo: sin cebolla, sin salsas, bien asado."
            }
          },
          required: ["nombre_producto", "cantidad"]
        }
      },
      notas: {
        type: ["string", "null"],
        description:
          "Notas generales del pedido completo."
      }
    },
    required: [
      "nombre_cliente",
      "telefono_cliente",
      "tipo_entrega",
      "metodo_pago",
      "items"
    ]
  }
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
