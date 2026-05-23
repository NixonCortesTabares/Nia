import { ServicioRepository } from "../infraestructure/repositories/ServicioRepository";
import { CitaRepository } from "../infraestructure/repositories/CitaRepository";
import { ConversacionRepository } from "../infraestructure/repositories/ConversacionRepository";
import { ClienteRepository } from "../infraestructure/repositories/ClienteRepository";
//import { ProfesionalRepository } from "../infraestructure/repositories/ProfesionalRepository";
//import { Servicio } from "../domain/entities/Servicio";
//import { CitaActivaConDuracionDTO } from "../domain/repositories/ICitaRepository";
import { GenerarPedidoUseCase, GenerarPedidoUseCaseDTO } from "../application/pedidos/GenerarPedidoUseCase";
import { NegocioRepository } from "../infraestructure/repositories/NegocioRepository";
import { PedidoRepository } from "../infraestructure/repositories/PedidoRepository";
import { ProductoRepository } from "../infraestructure/repositories/ProductoRepository";
import { ExtraRepository } from "../infraestructure/repositories/ExtraRepository";
import { CategoriaExtraRepository } from "../infraestructure/repositories/CategoriaExtraRepository";

function textoValido(valor: unknown): valor is string {
    return typeof valor === 'string' && valor.trim().length > 0;
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
    negocioId: string, conversacionId: string, clienteId: string): Promise<string> {
    try {

        if (nombre === 'escalar_conversacion') {
            const conversacionRepo = new ConversacionRepository();
            const actualizarConver = await conversacionRepo.actualizar(conversacionId, { estado: 'escalada' });
            if (!actualizarConver) {
                return 'No se pudo actualizar la conversacion';
            }
            return 'Conversacion escalada exitosamente. Un humano atenderá al cliente pronto.';
        }

        if (nombre === 'generar_pedido') {
            const errorValidacion = validarCamposObligatorios(input, [
                'nombre_cliente',
                'telefono_cliente',
                'tipo_entrega',
                'metodo_pago',
            ]);

            if (errorValidacion) {
                return errorValidacion;
            }

            if (!arregloValido(input.items)) {
                return 'Faltan productos para generar el pedido.';
            }

            const pedidoRepo = new PedidoRepository();
            const productoRepo = new ProductoRepository();
            const extraRepo = new ExtraRepository();
            const categoriaExtraRepo = new CategoriaExtraRepository();

            const generarPedidoUseCase = new GenerarPedidoUseCase(
                pedidoRepo,
                productoRepo,
                extraRepo,
                categoriaExtraRepo
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

            return `Pedido generado exitosamente.

                Cliente: ${pedidoGenerado.pedido.nombreCliente}
                Teléfono: ${pedidoGenerado.pedido.telefonoCliente}
                Método de pago: ${pedidoGenerado.pedido.metodoPago}
                Tipo de entrega: ${pedidoGenerado.pedido.tipoEntrega}
                Dirección: ${pedidoGenerado.pedido.direccionEntrega ?? 'No aplica'}

                Productos:
                ${resumenItems}

                Total: $${pedidoGenerado.total}`;
        }
        return "No se encontró una herramienta con ese nombre."
    }
    catch (error) {
        console.error('Error en herramienta', nombre, error);

        if ((error as { code?: string }).code === '23505') {
            return 'No se pudo completar la operación porque ya existe un registro similar. Revisa los datos e intenta de nuevo.';
        }

        if (error instanceof Error) {
            return error.message;
        }

        return 'Hubo un error ejecutando la herramienta solicitada. Intenta de nuevo o pide ayuda a una persona del negocio.';
    }


}
