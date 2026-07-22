import { Request, Response } from "express";


interface Pendientes {
    res: Response,
    negocioId: string
}
export class EventoController {

    private clientesEsperando: Pendientes[] = [];

    GuardarRequest = async (req: Request, res: Response) => {
        try {
            if (!req.user?.negocioId) {
                res.status(401).json({
                    ok: false,
                    mensaje: "No autorizado"
                })
                return;
            }
            const negocioId = req.user?.negocioId;

            const pendiente: Pendientes = {
                res,
                negocioId
            }

            this.clientesEsperando.push(pendiente);

            req.on("close", () => {
                this.clientesEsperando = this.clientesEsperando.filter(
                    solicitud => solicitud !== pendiente
                );
            });
            return;
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                mensaje: "error guardando la solicitud"
            });
            console.log(error);
            return;
        }

    }

    ConcluirResponse = async (negocioId: string, evento: string) => {
        const clientesEsperandoActualizado: Pendientes[] = [];
        for (const solicitud of this.clientesEsperando) {
            if (solicitud.negocioId === negocioId) {
                solicitud.res.status(200).json({
                    ok: true,
                    mensaje: "evento recibido",
                    evento: evento
                });
            }
            else { clientesEsperandoActualizado.push(solicitud); }
        }
        this.clientesEsperando = clientesEsperandoActualizado;
        return;
    }


}