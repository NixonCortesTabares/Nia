import { suscribirEvento } from "../api/apiEvento";

export async function escucharEventos(): Promise<string | null> {

    try {
        const respuesta = await suscribirEvento();
        return respuesta.evento;
    }
    catch (error) {
        console.log('error al suscribirse a eventos', error);
        return null
     }
    finally { 
        escucharEventos()
    }

}