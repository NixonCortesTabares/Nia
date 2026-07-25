import { Request, Response } from "express";

interface Pendientes {
    res: Response;
    negocioId: string;
    timeout: NodeJS.Timeout;
}

export class EventoController {

    private clientesEsperando: Pendientes[] = [];

    private eliminarPendiente(pendiente: Pendientes) {
        this.clientesEsperando = this.clientesEsperando.filter(
            solicitud => solicitud !== pendiente
        );
    }

    GuardarRequest = async (req: Request, res: Response) => {
        try {

            if (!req.user?.negocioId) {
                return res.status(401).json({
                    ok: false,
                    mensaje: "No autorizado"
                });
            }

            const negocioId = req.user.negocioId;

            // Se crea primero vacío para poder referenciarlo
            const pendiente = {} as Pendientes;

            const timeout = setTimeout(() => {

                this.eliminarPendiente(pendiente);

                if (!res.headersSent) {
                    res.sendStatus(204);
                }

            }, 60_000);
            
            pendiente.res = res;
            pendiente.negocioId = negocioId;
            pendiente.timeout = timeout;
            //console.log('solicitud creada:')
            //console.log(pendiente.negocioId);
            this.clientesEsperando.push(pendiente);
            //console.log('solicitud guardada correctamente')
            res.on("close", () => {
                clearTimeout(timeout);
                this.eliminarPendiente(pendiente);
                //console.log('solicitud eliminada.');
            });

        }
        catch (error) {

            console.log(error);

            if (!res.headersSent) {
                res.status(500).json({
                    ok: false,
                    mensaje: "Error guardando la solicitud"
                });
            }
        }
    };

    ConcluirResponse = async (
        negocioId: string,
        evento: string
    ): Promise<boolean> => {

        try {

            const clientesPendientes: Pendientes[] = [];

            for (const solicitud of this.clientesEsperando) {

                if (solicitud.negocioId !== negocioId) {
                    clientesPendientes.push(solicitud);
                    continue;
                }

                clearTimeout(solicitud.timeout);

                if (solicitud.res.headersSent) {
                    continue;
                }

                console.log("EVENTO EMITIDO:", evento);

                solicitud.res.status(200).json({
                    ok: true,
                    evento
                });

            }

            this.clientesEsperando = clientesPendientes;

            return true;

        }
        catch (error) {

            console.log("Error concluyendo responses de eventos");
            console.log(error);

            return false;

        }

    };

}