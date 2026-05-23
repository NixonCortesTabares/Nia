# PROJECT_RULES.md - Nia SaaS (Reglas OBLIGATORIAS)

## 1. REGLAS GENERALES (NUNCA ROMPER)
- Soy el arquitecto principal. Tú eres solo el programador ejecutor.
- **Debes seguir exactamente** todo lo que está escrito en este archivo.
- Nunca propongas cambios de arquitectura, carpetas, tecnologías o flujos.
- Nunca saltes fases. Solo trabajas en la fase que yo te indique explícitamente.
- Nunca crees carpetas, archivos ni renombres sin que yo te lo autorice por escrito.
- Si tienes duda, pregunta primero. Nunca asumas.

## 2. STACK TÉCNICO FIJO (no cambiar)
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Base de datos: PostgreSQL (con migraciones)
- IA: Claude (Anthropic) con Tool Use
- WhatsApp: WhatsApp Business Cloud API
- Monorepo (usando workspaces o turbo según decida en Fase 0)

## 3. ESTRUCTURA DE CARPETAS OBLIGATORIA (Fase 0)
Debes respetar **exactamente** esta estructura. No crearás ninguna otra carpeta.
nia-project/
├── client/                  # Frontend (React + Vite)
│   ├── public/
│   └── src/
│       └── assets/
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── server/                  # Backend (Node.js + Express)
│   └── src/
│       ├── agent/
│       ├── application/
│       │   ├── analytics/
│       │   ├── auth/
│       │   ├── citas/
│       │   └── clientes/
│       ├── config/
│       │   └── db.ts
│       ├── domain/
│       │   ├── entities/
│       │   └── repositories/
│       ├── infraestructure/
│       │   └── http/
│       │       ├── controllers/
│       │       ├── middlewares/
│       │       └── routes/
│       │    └──repositories/
│       └── webhooks/
│
├── .env.example
├── package.json             # Root (monorepo)
└── PROJECT_RULES.md


Cualquier cambio a esta estructura requiere mi aprobación explícita.
Cualquier desviación de esta estructura se considera una violación grave.
## 4. ORDEN DE DESARROLLO (FIJO E INNEGOCIABLE)
Solo trabajarás en la fase que yo te indique. Nunca adelantes.

**Fase 0** — Base técnica  
**Fase 1** — Webhook de WhatsApp  
**Fase 2** — Orquestador IA con tools  
**Fase 3** — Agenda completa  
**Fase 4** — Dashboard mínimo  
**Fase 5** — Mensajes de recuperación

Aclarando las fases:
Fase 0 — Base técnica
    Antes del agente:monorepo
    Express
    conexión PostgreSQL
    migraciones
    autenticación básica del panel
    CRUD mínimo de categorias, productos, pedidos, extras, PedidoProducto, PedidoProductoExtra.
    Salida de esta fase: puedo entrar al sistema y cargar catálogo.
Fase 1 — Webhook de WhatsApp
    Luego:endpoint de verificación webhook
    endpoint para recibir mensajes entrantes
    persistir cliente / conversación / mensaje
    responder con un mensaje fijo de prueba
    registrar id del mensaje de WhatsApp y estado
    Meta documenta que Cloud API se basa precisamente en send messages + receive webhooks, así que esta es la primera integración crítica.
    Salida de esta fase: un cliente real escribe por WhatsApp y el sistema guarda la conversación.
Fase 2 — Orquestador IA con tools
    Después:prompt del sistema por vertical belleza
    registro de herramientas
    función runAgentTurn()
    ejecutar tool_use
    devolver tool_result
    responder al usuario
    Para bajar complejidad, empezaría con una sola llamada serial, no paralela. Anthropic permite paralelismo, pero para agenda inicial prefiero determinismo.
    Salida de esta fase: el agente ya puede consultar menu y hacer pedidos.
Fase 3 — Herramientas completas
    Luego: generar_pedido
    cancelar_pedido
    handoff a humano
    panel simple de pedidos
    Salida de esta fase: Nia ya resuelve el dolor principal.
Fase 4 — Dashboard mínimo pedidos por día
    clientes que no volvieron en X días
    Y el cálculo de “clientes en riesgo” al principio lo dejaría como una regla heurística.
    Luego lo refinamos con datos reales.
Fase 5 — Mensajes de recuperación
    Aquí entra el detalle importante de WhatsApp: fuera de la ventana de 24 horas, esos mensajes deben salir como template messages, no como texto libre. Entonces el feature de recuperación necesita:una o dos plantillas aprobadas
    variable de nombre/servicio
    generación del copy por IA solo para sugerencia interna o para construir variables dentro de la plantilla
    No diseñemos recuperación sin contemplar eso.


## 5. FORMATO OBLIGATORIO DE RESPUESTA
**Siempre** responde con este formato exacto (nada de texto libre antes o después):

FASE ACTUAL: 

XARCHIVO: backend/src/routes/whatsapp.ts   ← ruta completa 

CAMBIOS:
1. ...
2. ...

CÓDIGO COMPLETO: typescript


**Instrucción final para la IA:**
Cada vez que respondas, al final **debes** escribir exactamente:

`Todas las reglas de PROJECT_RULES.md fueron respetadas`

Si rompiste alguna regla, escribe en su lugar:
`REGLA ROTA: #número_de_regla - explicación`

---
