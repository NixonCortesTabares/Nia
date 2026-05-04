import { ServicioRepository } from "../infraestructure/repositories/ServicioRepository";
import { CitaRepository } from "../infraestructure/repositories/CitaRepository";
import { ConversacionRepository } from "../infraestructure/repositories/ConversacionRepository";
export async function ejecutarHerramienta(nombre: string, input: any, 
    negocioId: string, conversacionId: string):Promise<string>{
    try{
        if(nombre === "consultar_servicios"){
        const servicioRepo = new ServicioRepository()
        const servicios = await servicioRepo.buscarPorNegocio(negocioId);

        if(servicios.length === 0){
            return "Este negocio no tiene servicios aun."
        }
        return servicios.map(s => `${s.nombre}: $${s.precioBase}`).join('\n');
    }

        if(nombre === "consultar_disponibilidad"){

            const arrayHorasDisponibles = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00', '18:00']
            const citaRepo = new CitaRepository()
            const citas = await citaRepo.buscarHorasOcupadas(negocioId, input.fecha);

            if(!citas){
                return `Horas disponibles: ${arrayHorasDisponibles.join(',')}`
            }
            const horasLibres = arrayHorasDisponibles.filter(h => !citas.includes(h));
            return `Horas disponibles: ${horasLibres.join(',')}`;
        }

        if(nombre === 'escalar_conversacion'){
            const conversacionRepo = new ConversacionRepository();
            const actualizarConver = await conversacionRepo.actualizar(conversacionId, {estado: 'escalada'});
            if(!actualizarConver){
                return 'No se pudo actualizar la conversacion';
            }
            return 'Conversacion escalada exitosamente. Un humano atenderá al cliente pronto.';
        }
    return "No se encontró una herramienta con ese nombre."
    }
    catch(error){
        return "Error obteniendo los servicios del negocio";
    }

    
}