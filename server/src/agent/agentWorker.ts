import pool from "../config/db";
import { ClienteRepository } from "../infraestructure/repositories/ClienteRepository";
import { ConversacionRepository } from "../infraestructure/repositories/ConversacionRepository";
import { MensajeRepository } from "../infraestructure/repositories/MensajeRepository";
import { NegocioRepository } from "../infraestructure/repositories/NegocioRepository";
import { runAgentTurn } from ".";
import { enviarMensaje } from "./whatsapp";
import { PedidoBorrador } from "../domain/entities/Conversacion";
import { MenuProductoRow, ProductoRepository } from "../infraestructure/repositories/ProductoRepository";
import { ConstruirMenuUseCase } from "../application/menu/ConstruirMenuUseCase";

const WORKER_INTERVAL_MS = 5000;
const PENDING_LIMIT = 10;

const negocioRepo = new NegocioRepository();
const conversacionRepo = new ConversacionRepository();
const mensajeRepo = new MensajeRepository();
const clienteRepo = new ClienteRepository();
const productoRepo = new ProductoRepository();
let workerStarted = false;
let workerTickRunning = false;

export function startAgentWorker(): void {
  if (workerStarted) {
    return;
  }

  workerStarted = true;
  //console.log("Agent worker iniciado");

  setInterval(() => {
    procesarPendientes().catch((error) => {
      console.error("Error en agent worker:", error);
    });
  }, WORKER_INTERVAL_MS);
}

async function procesarPendientes(): Promise<void> {
  if (workerTickRunning) {
    return;
  }

  workerTickRunning = true;

  try {
    const conversacionesPendientes =
      await conversacionRepo.buscarPendientesParaAgente(PENDING_LIMIT);

    for (const conversacion of conversacionesPendientes) {
      try {
        await procesarConversacionConLock(conversacion.id);
      } catch (error) {
        console.error("Error procesando conversación pendiente:", error);
      }
    }
  } finally {
    workerTickRunning = false;
  }
}

async function procesarConversacionConLock(conversacionId: string): Promise<void> {
  const db = await pool.connect();
  let locked = false;

  try {
    const lockResult = await db.query<{ locked: boolean }>(
      "SELECT pg_try_advisory_lock(hashtext($1)) AS locked",
      [conversacionId]
    );

    locked = lockResult.rows[0]?.locked === true;

    if (!locked) {
      console.log(
        "Conversación ya está siendo procesada por otra instancia:",
        conversacionId
      );
      return;
    }

    console.log("Procesando conversación pendiente:", conversacionId);
    await procesarConversacionPendiente(conversacionId);
  } finally {
    if (locked) {
      await db.query("SELECT pg_advisory_unlock(hashtext($1))", [
        conversacionId,
      ]);
    }

    db.release();
  }
}

async function procesarConversacionPendiente(
  conversacionId: string
): Promise<void> {
  const conversacion = await conversacionRepo.buscarPorId(conversacionId);
  
  if (!conversacion) {
    return;
  }

  const pedidoBorrador:PedidoBorrador = conversacion.pedidoBorrador;

  if (conversacion.estado !== "activa") {
    await conversacionRepo.limpiarRespuestaPendiente(conversacion.id);
    console.log("Conversación escalada/no activa. El agente no responde");
    return;
  }

  const negocio = await negocioRepo.buscarPorId(conversacion.negocioId);
  const cliente = await clienteRepo.buscarPorId(conversacion.clienteId);

  if (!negocio || !cliente) {
    console.error("No se encontró negocio o cliente para conversación:", {
      conversacionId: conversacion.id,
      negocioId: conversacion.negocioId,
      clienteId: conversacion.clienteId,
    });
    return;
  }

  if(negocio.activo === false){
    await conversacionRepo.limpiarRespuestaPendiente(conversacion.id);
    return;
  }

  const ultimoMensajeCliente = await mensajeRepo.buscarUltimoMensajeCliente(
    conversacion.id, negocio.id
  );

  if (!ultimoMensajeCliente) {
    await conversacionRepo.limpiarRespuestaPendiente(conversacion.id);
    return;
  }

  const historial = (await mensajeRepo.buscarPorConversacion(conversacion.id, negocio.id)).slice(-4);

  const menuBruto = await productoRepo.buscarMenuActivoPorNegocio(negocio.id);

  if(!menuBruto){
    throw new Error('El negocio no tiene un menu consstruido para el agente');
  }

  const menu = ConstruirMenuUseCase(menuBruto);
  console.log("MENUUU::::::::");
  console.log(menu);
  const respuesta = await runAgentTurn({
    negocio,
    cliente,
    conversacion,
    historial,
    mensajeCliente: ultimoMensajeCliente.contenido,
    pedidoBorrador,
    menu
  });

  if (respuesta) {

    console.log(respuesta)

    await conversacionRepo.actualizarPedidoBorrador(
    conversacion.id,
    respuesta.pedidoBorrador
  );

  if(!negocio.telefonoWs){
    throw new Error('Este negocio no tiene id del numero del whatsapp')
  }
    const wamidRta = await enviarMensaje(cliente.telefono, respuesta.mensajeCliente, negocio.telefonoWs);

    await mensajeRepo.crear({
      conversacionId: conversacion.id,
      rol: "agente",
      contenido: respuesta.mensajeCliente,
      wamid: wamidRta,
    }, negocio.id);

    //console.log("Respuesta enviada por worker");
  }

  await conversacionRepo.marcarProcesadaHastaMensaje(
    conversacion.id,
    ultimoMensajeCliente.id
  );
}
