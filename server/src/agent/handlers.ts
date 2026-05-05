import { ServicioRepository } from "../infraestructure/repositories/ServicioRepository";
import { CitaRepository } from "../infraestructure/repositories/CitaRepository";
import { ConversacionRepository } from "../infraestructure/repositories/ConversacionRepository";
import { ClienteRepository } from "../infraestructure/repositories/ClienteRepository";
import { ProfesionalRepository } from "../infraestructure/repositories/ProfesionalRepository";

export async function ejecutarHerramienta(nombre: string, input: any,
    negocioId: string, conversacionId: string, clienteId: string): Promise<string> {
    try {
        if (nombre === "consultar_servicios") {
            const servicioRepo = new ServicioRepository()
            const servicios = await servicioRepo.buscarPorNegocio(negocioId);

            if (servicios.length === 0) {
                return "Este negocio no tiene servicios aun."
            }
            return servicios.map(s =>
                `ID: ${s.id}\nServicio: ${s.nombre}\nPrecio: $${s.precioBase}\nDuración: ${s.duracionMinutos} minutos`
            ).join('\n\n');
        }

        if (nombre === "consultar_disponibilidad") {

            const arrayHorasDisponibles = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']
            const citaRepo = new CitaRepository()
            const citas = await citaRepo.buscarHorasOcupadas(negocioId, input.fecha);

            if (!citas) {
                return `Horas disponibles: ${arrayHorasDisponibles.join(',')}`
            }
            const horasLibres = arrayHorasDisponibles.filter(h => !citas.includes(h));
            return `Horas disponibles: ${horasLibres.join(',')}`;
        }

        if (nombre === 'escalar_conversacion') {
            const conversacionRepo = new ConversacionRepository();
            const actualizarConver = await conversacionRepo.actualizar(conversacionId, { estado: 'escalada' });
            if (!actualizarConver) {
                return 'No se pudo actualizar la conversacion';
            }
            return 'Conversacion escalada exitosamente. Un humano atenderá al cliente pronto.';
        }

        if (nombre === 'consultar_citas_cliente') {
            const citaRepo = new CitaRepository();
            const citasCliente = await citaRepo.buscarPorCliente(clienteId);

            if (citasCliente.length === 0) {
                return 'El cliente no tiene citas pendientes';
            }

            return citasCliente.map(c =>
                `ID: ${c.id}\nServicio: ${c.servicioId}\nFecha: ${c.fecha}\nHora: ${c.hora}\nEstado: ${c.estado}`
            ).join('\n\n');
        }

        if (nombre === 'agendar_cita') {

            const servicioRepo = new ServicioRepository();
            const servicios = await servicioRepo.buscarPorNegocio(negocioId);
            const servicio = servicios.find(
                s => s.nombre.toLowerCase() === input.nombre_servicio.toLowerCase()
            );
            if (!servicio) {
                return `No existe el servicio "${input.nombre_servicio}" en este negocio.`;
            }

            const profesionalRepo = new ProfesionalRepository();
            const profesionales = await profesionalRepo.buscarPorNegocio(negocioId);
            const profesional = profesionales[0] ?? null;

            const clienteRepo = new ClienteRepository();
            await clienteRepo.actualizar(clienteId, { nombre: input.nombre_cliente });

            const citaRepo = new CitaRepository();
            const cita = await citaRepo.crear({
                negocioId,
                clienteId,
                conversacionId,
                servicioId: servicio.id,
                profesionalId: profesional?.id,
                fecha: new Date(input.fecha),
                hora: input.hora,
            });

            if (!cita) {
                return "No se pudo crear la cita."
            }

           return `Cita creada exitosamente. Servicio: ${servicio.nombre}, Fecha: ${input.fecha}, Hora: ${input.hora}, Cliente: ${input.nombre_cliente}`;

        }

        if (nombre === 'cancelar_cita') {
            const citaRepo = new CitaRepository();
            const cancelacionCita = await citaRepo.actualizar(input.cita_id, { estado: 'cancelada' });
            if (!cancelacionCita) {
                return 'No se pudo cancelar la cita.'
            }

            return `Cita cancelada con exito ${cancelacionCita}`;
        }

        if (nombre === 'reagendar_cita') {
            const citaRepo = new CitaRepository();
            const reagendarCita = await citaRepo.actualizar(input.cita_id, { fecha: input.nueva_fecha, hora: input.nueva_hora });
            if (!reagendarCita) {
                return 'No se pudo reagendar la cita';
            };
            return `Cita reagendada con exito: ${reagendarCita}`
        }
        return "No se encontró una herramienta con ese nombre."
    }
    catch (error) {
        console.error('Error en herramienta', nombre, error);
        return "Error obteniendo los servicios del negocio";
    }


}