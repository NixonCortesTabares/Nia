# Nia

Nia es un asistente inteligente para restaurantes diseñado para automatizar la atención de clientes y la gestión de pedidos a través de WhatsApp.

El proyecto busca resolver principalmente el problema de **gestionar múltiples conversaciones y pedidos de manera simultánea**, reduciendo el trabajo manual necesario para recibir, interpretar y confirmar pedidos.

## Problema

En un restaurante, la recepción de pedidos por WhatsApp puede convertirse en una tarea repetitiva, especialmente cuando varios clientes escriben al mismo tiempo.

Nia busca automatizar este proceso permitiendo que el sistema:

- Entienda las solicitudes de los clientes.
- Consulte los productos disponibles.
- Construya y valide pedidos.
- Gestione modificaciones y cancelaciones.
- Confirme los detalles del pedido.
- Mantenga el contexto de la conversación.

El objetivo es que el restaurante pueda recibir pedidos sin tener que gestionar manualmente cada conversación.

## Arquitectura

Nia está desarrollado como un **monolito modular**, con una aplicación frontend separada del backend.

El backend utiliza **Clean Architecture** para separar las reglas de negocio de los detalles de infraestructura.

La estructura conceptual del backend se divide en:

- **Domain:** entidades y reglas de negocio.
- **Application:** casos de uso y lógica de aplicación.
- **Infrastructure:** PostgreSQL, APIs externas y otros detalles técnicos.
- **Interfaces:** controladores y entrada/salida del sistema.

Esta separación permite modificar detalles de infraestructura sin acoplarlos directamente a la lógica del negocio.

## Tecnologías

### Backend

- TypeScript
- Node.js
- Express
- PostgreSQL
- APIs de inteligencia artificial
- REST API

### Frontend

- React
- TypeScript
- Vite

### Base de datos

Nia utiliza **PostgreSQL** como sistema de persistencia.

La base de datos almacena información relacionada con:

- Negocios
- Clientes
- Conversaciones
- Productos
- Pedidos

Además, PostgreSQL se utiliza para mantener el estado necesario para que Nia pueda continuar una conversación y gestionar un pedido.

El proyecto busca aplicar principios de ingeniería de software más allá de simplemente construir endpoints.

Entre ellos:

- **Clean Architecture**
- **Separación de responsabilidades**
- **Casos de uso**
- **Inyección de dependencias**
- **Programación orientada a objetos**
- **Tipado estático con TypeScript**
- **Diseño basado en dominio**
- **Persistencia relacional**
- **APIs REST**
- **Arquitectura monolítica modular**
- **Integración con servicios externos**
- **Manejo de estado conversacional**

## Estado del proyecto

Nia fue desarrollado como un proyecto práctico y llegó a ser utilizado en un entorno real.

El proyecto también permitió experimentar con problemas que aparecen al construir software para usuarios reales, especialmente en:

- Diseño de flujos conversacionales.
- Integración con servicios externos.
- Persistencia del estado.
- Validación de información proporcionada por modelos de IA.
- Diseño de reglas de negocio.
- Evolución de una aplicación existente.

Actualmente Nia se mantiene principalmente como un proyecto de aprendizaje y portafolio enfocado en **backend, arquitectura de software e integración de sistemas**.
