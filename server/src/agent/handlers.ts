//import { ServicioRepository } from "../infraestructure/repositories/ServicioRepository";
//import { CitaRepository } from "../infraestructure/repositories/CitaRepository";
import { ConversacionRepository } from "../infraestructure/repositories/ConversacionRepository";
//import { ClienteRepository } from "../infraestructure/repositories/ClienteRepository";
//import { ProfesionalRepository } from "../infraestructure/repositories/ProfesionalRepository";
//import { Servicio } from "../domain/entities/Servicio";
//import { CitaActivaConDuracionDTO } from "../domain/repositories/ICitaRepository";
import { GenerarPedidoUseCase, GenerarPedidoUseCaseDTO } from "../application/pedidos/GenerarPedidoUseCase";
import { NegocioRepository } from "../infraestructure/repositories/NegocioRepository";
import { PedidoRepository } from "../infraestructure/repositories/PedidoRepository";
import { ProductoRepository } from "../infraestructure/repositories/ProductoRepository";
import { ExtraRepository } from "../infraestructure/repositories/ExtraRepository";
import { CategoriaExtraRepository } from "../infraestructure/repositories/CategoriaExtraRepository";
import { PrepararPedidoService } from "../application/pedidos/services/PrepararPedidoService";
import { ModificarOCancelarPedidoUseCase } from "../application/pedidos/ModificarOCancelarPedidoUseCase";
import { ClienteRepository } from "../infraestructure/repositories/ClienteRepository";
import { enviarMensaje } from "./whatsapp";

function textoValido(valor: unknown): valor is string {
    return typeof valor === 'string' && valor.trim().length > 0;
}

export type ToolResultado = {
    ok: boolean
    mensaje: string
}

function arregloValido(valor: unknown): valor is unknown[] {
    return Array.isArray(valor) && valor.length > 0;
}

function validarCamposObligatorios(input: any, campos: string[]): string | null {
    const faltantes = campos.filter((campo) => !textoValido(input?.[campo]));

    if (faltantes.length > 0) {
        return `Faltan datos obligatorios para ejecutar la herramienta: ${faltantes.join(', ')}.`;
    }

    return null;
}


export async function ejecutarHerramienta(nombre: string, input: any,
    negocioId: string, conversacionId: string, clienteId: string): Promise<ToolResultado> {
    try {

        if (nombre === 'escalar_conversacion') {
            const conversacionRepo = new ConversacionRepository();
            const actualizarConver = await conversacionRepo.actualizar(conversacionId, { estado: 'escalada' });
            if (!actualizarConver) {
                return {
                    ok: false, mensaje: 'No se pudo actualizar la conversacion'
                };
            }
            return { ok: true, mensaje: 'Una persona te atenderá pronto.' };
        }

        if (nombre === 'generar_pedido') {
            const errorValidacion = validarCamposObligatorios(input, [
                'nombre_cliente',
                'telefono_cliente',
                'tipo_entrega',
                'metodo_pago',
            ]);

            if (errorValidacion) {
                return { ok: false, mensaje: errorValidacion };
            }

            if (!arregloValido(input.items)) {
                return { ok: false, mensaje: 'Faltan productos para generar el pedido.' };
            }

            const pedidoRepo = new PedidoRepository();
            const productoRepo = new ProductoRepository();
            const extraRepo = new ExtraRepository();
            const categoriaExtraRepo = new CategoriaExtraRepository();
            const negocioRepo = new NegocioRepository();
            const negocio = await negocioRepo.buscarPorId(negocioId);

            if (!negocio) {
                return { ok: false, mensaje: 'No se pudo encontrar el negocio.' };
            }

            if (!textoValido(negocio.numtel)) {
                return { ok: false, mensaje: 'El negocio no tiene un número de teléfono configurado.' };
            }

            if (!textoValido(negocio.telefonoWs)) {
                return { ok: false, mensaje: 'El negocio no tiene un id de WhatsApp configurado.' };
            }

            const pedidoService = new PrepararPedidoService(productoRepo, extraRepo, categoriaExtraRepo, negocioRepo);
            const clienteRepo = new ClienteRepository();
            const generarPedidoUseCase = new GenerarPedidoUseCase(
                pedidoRepo,
                pedidoService,
                clienteRepo
            );

            const pedidoGenerado = await generarPedidoUseCase.execute({
                negocioId,
                clienteId,
                conversacionId,
                nombreCliente: input.nombre_cliente,
                telefonoCliente: input.telefono_cliente,
                tipoEntrega: input.tipo_entrega,
                direccionEntrega: input.direccion_entrega ?? null,
                metodoPago: input.metodo_pago,
                items: input.items.map((item: any) => ({
                    nombreProducto: item.nombre_producto,
                    cantidad: item.cantidad,
                    extras: Array.isArray(item.extras) ? item.extras : [],
                    notas: item.notas ?? null,
                })),
                notas: input.notas ?? null,
            });

            const resumenItems = pedidoGenerado.productos
                .map((item) => {
                    const extrasTexto =
                        item.extras.length > 0
                            ? ` + ${item.extras.map((extra) => extra.nombreExtra).join(', ')}`
                            : '';

                    const notasTexto = item.producto.notas
                        ? ` (${item.producto.notas})`
                        : '';

                    return `- ${item.producto.cantidad} x ${item.producto.nombreProducto}${extrasTexto}${notasTexto}: $${item.producto.subtotal}`;
                })
                .join('\n');

            const resumenNegocio = `*Nuevo pedido #${pedidoGenerado.pedido.id}*

Cliente: ${pedidoGenerado.pedido.nombreCliente}
Teléfono: ${pedidoGenerado.pedido.telefonoCliente}
Tipo de entrega: ${pedidoGenerado.pedido.tipoEntrega}
Dirección: ${pedidoGenerado.pedido.direccionEntrega ?? 'No aplica'}
Método de pago: ${pedidoGenerado.pedido.metodoPago}

Productos:
${resumenItems}

Domicilio: $${pedidoGenerado.pedido.costoDomicilio}
Total: $${pedidoGenerado.total}
Notas: ${pedidoGenerado.pedido.notas ?? 'Sin notas'}`;

            //await enviarMensaje(negocio.numtel, resumenNegocio, negocio.telefonoWs);
            if (pedidoGenerado.pedido.metodoPago === 'transferencia') {
                return {
                    ok: true, mensaje:
`Ya tenemos tu pedido.

Cliente: ${pedidoGenerado.pedido.nombreCliente}
Teléfono: ${pedidoGenerado.pedido.telefonoCliente}
Método de pago: ${pedidoGenerado.pedido.metodoPago}
Dirección: ${pedidoGenerado.pedido.direccionEntrega ?? 'No aplica'}

Productos:
    ${resumenItems}
El domicilio tiene un valor de $${pedidoGenerado.pedido.costoDomicilio}
Total: $${pedidoGenerado.total}
                
*No olvides mandar pantallazo de la transferencia para poder empezar a realizar el pedido*
*Numero de nequi/bancolombia:* ${negocio?.numtel}
*Por temas de organización y sistema, tienes 3 minutos en caso de que quieras modificar tu pedido.*`
                };
            }
            else {

                return {
                    ok: true, mensaje: `
Ya tenemos tu pedido.

Cliente: ${pedidoGenerado.pedido.nombreCliente}
Teléfono: ${pedidoGenerado.pedido.telefonoCliente}
Método de pago: ${pedidoGenerado.pedido.metodoPago}
Dirección: ${pedidoGenerado.pedido.direccionEntrega ?? 'No aplica'}

Productos:
  ${resumenItems}
El domicilio tiene un valor de $${pedidoGenerado.pedido.costoDomicilio}
Total: $${pedidoGenerado.total}.
*Por temas de organización y sistema, tienes 3 minutos en caso de que quieras modificar tu pedido.*`
                };
            }
        }
        if (nombre === 'modificar_o_cancelar_pedido') {

            const pedidoRepo = new PedidoRepository();
            const productoRepo = new ProductoRepository();
            const extraRepo = new ExtraRepository();
            const categoriaExtraRepo = new CategoriaExtraRepository();
            const negocioRepo = new NegocioRepository();
            const negocio = await negocioRepo.buscarPorId(negocioId);
            const pedidoService = new PrepararPedidoService(productoRepo, extraRepo, categoriaExtraRepo, negocioRepo);
            const modificarOCancelarPedidoUseCase = new ModificarOCancelarPedidoUseCase(
                pedidoRepo,
                pedidoService,
                negocioRepo
            );

            if (input.tipo_cambio === 'modificacion') {

                const errorValidacion = validarCamposObligatorios(input, [
                    'nombre_cliente',
                    'telefono_cliente',
                    'tipo_entrega',
                    'metodo_pago',
                ]);

                if (errorValidacion) {
                    return { ok: false, mensaje: errorValidacion };
                }

                if (!arregloValido(input.items)) {
                    return { ok: false, mensaje: 'Faltan productos para generar el pedido.' };
                }

                const pedidoGenerado = await modificarOCancelarPedidoUseCase.executeModificacion({
                    negocioId,
                    clienteId,
                    conversacionId,
                    nombreCliente: input.nombre_cliente,
                    telefonoCliente: input.telefono_cliente,
                    tipoEntrega: input.tipo_entrega,
                    direccionEntrega: input.direccion_entrega ?? null,
                    metodoPago: input.metodo_pago,
                    items: input.items.map((item: any) => ({
                        nombreProducto: item.nombre_producto,
                        cantidad: item.cantidad,
                        extras: Array.isArray(item.extras) ? item.extras : [],
                        notas: item.notas ?? null,
                    })),
                    notas: input.notas ?? null,
                });

                if (!pedidoGenerado) {
                    return { ok: false, mensaje: "No podemos modificar tu pedido. explicale al cliente que ya va en camino." }
                }

                const resumenItems = pedidoGenerado.productos
                    .map((item) => {
                        const extrasTexto =
                            item.extras.length > 0
                                ? ` + ${item.extras.map((extra) => extra.nombreExtra).join(', ')}`
                                : '';

                        const notasTexto = item.producto.notas
                            ? ` (${item.producto.notas})`
                            : '';

                        return `- ${item.producto.cantidad} x ${item.producto.nombreProducto}${extrasTexto}${notasTexto}: $${item.producto.subtotal}`;
                    })
                    .join('\n');

                if (pedidoGenerado.pedido.metodoPago === 'transferencia') {
                    return {
                        ok: true, mensaje: `
Pedido modificado exitosamente.

Cliente: ${pedidoGenerado.pedido.nombreCliente}
Teléfono: ${pedidoGenerado.pedido.telefonoCliente}
Método de pago: ${pedidoGenerado.pedido.metodoPago}
Dirección: ${pedidoGenerado.pedido.direccionEntrega ?? 'No aplica'}

Productos:
  ${resumenItems}
El domicilio tiene un valor de $${pedidoGenerado.pedido.costoDomicilio}
Total: $${pedidoGenerado.total}
*Recuerda enviar el comprobante de la transacción para poder pasar el pedido a cocina.*
*Numero de nequi/bancolombia:* ${negocio?.numtel}
`
                    };
                }
                return {
                    ok: true, mensaje: `
Pedido modificado exitosamente.

Cliente: ${pedidoGenerado.pedido.nombreCliente}
Teléfono: ${pedidoGenerado.pedido.telefonoCliente}
Método de pago: ${pedidoGenerado.pedido.metodoPago}
Dirección: ${pedidoGenerado.pedido.direccionEntrega ?? 'No aplica'}

Productos:
 ${resumenItems}
El domicilio tiene un valor de $${pedidoGenerado.pedido.costoDomicilio}
Total: $${pedidoGenerado.total}`
                };


            }
            if (input.tipo_cambio === 'cancelacion') {
                const pedidoCancelado = await modificarOCancelarPedidoUseCase.executeCancelacion(negocioId, conversacionId);
                if (pedidoCancelado === null) {
                    return { ok: false, mensaje: "Explicale al cliente que no podemos cancelar el pedido porque ya va en camino. Si insiste escala la conversacion" }
                }
                return { ok: true, mensaje: pedidoCancelado };
            }

            else {
                return { ok: false, mensaje: "Error al modificar o cancelar el pedido, el tipo_cambio no es ni modificacion ni cancelacion" }
            }

        }

        return { ok: false, mensaje: "No se encontró una herramienta con ese nombre." }
    }
    catch (error) {
        console.error('Error en herramienta', nombre, error);

        if ((error as { code?: string }).code === '23505') {
            return { ok: false, mensaje: 'No se pudo completar la operación porque ya existe un registro similar. Revisa los datos e intenta de nuevo.' };
        }

        if (error instanceof Error) {
            return { ok: false, mensaje: error.message };
        }

        return { ok: false, mensaje: 'Hubo un error ejecutando la herramienta solicitada. Intenta de nuevo o pide ayuda a una persona del negocio.' };
    }


}
