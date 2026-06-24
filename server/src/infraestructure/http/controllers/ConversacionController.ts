import { Request, Response } from 'express';
import { ListarConversacionesUseCase } from '../../../application/conversaciones/ListarConversacionesUseCase';
import { ObtenerConversacionUseCase } from '../../../application/conversaciones/ObtenerConversacionUseCase';
import { TomarControlConversacionUseCase } from '../../../application/conversaciones/TomarControlConversacionUseCase';
import { Conversacion } from '../../../domain/entities/Conversacion';
import { IConversacionRepository } from '../../../domain/repositories/IConversacionRepository';

function mapConversacionDetalle(conversacion: Conversacion) {
  return {
    id: conversacion.id,
    negocioId: conversacion.negocioId,
    clienteId: conversacion.clienteId,
    tipo: conversacion.tipo,
    estado: conversacion.estado,
    resumen: conversacion.resumen,
    creadoEn: conversacion.iniciadaEn,
    cerradoEn: conversacion.cerradaEn,
    ultimaActividadEn: conversacion.ultimoMensajeEn,
  };
}

export class ConversacionController {
  constructor(
    private conversacionRepository: IConversacionRepository
  ) {}

  ListarConversaciones = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const useCase = new ListarConversacionesUseCase(
        this.conversacionRepository
      );

      const conversaciones = await useCase.execute(req.user.negocioId);

      return res.status(200).json({
        ok: true,
        mensaje: 'Conversaciones obtenidas.',
        conversaciones,
      });
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);

      return res.status(500).json({
        ok: false,
        mensaje:
          error instanceof Error
            ? error.message
            : 'Error interno obteniendo conversaciones.',
      });
    }
  };

  ObtenerConversacion = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const useCase = new ObtenerConversacionUseCase(
        this.conversacionRepository
      );

      const conversacion = await useCase.execute(
        req.params.id,
        req.user.negocioId
      );

      if (!conversacion) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Conversación no encontrada.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Conversación obtenida.',
        conversacion: mapConversacionDetalle(conversacion),
      });
    } catch (error) {
      console.error('Error obteniendo conversación:', error);

      return res.status(500).json({
        ok: false,
        mensaje:
          error instanceof Error
            ? error.message
            : 'Error interno obteniendo conversación.',
      });
    }
  };

  TomarControl = async (req: Request, res: Response) => {
    try {
      if (!req.user?.negocioId) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Usuario no autenticado.',
        });
      }

      const useCase = new TomarControlConversacionUseCase(
        this.conversacionRepository
      );

      const conversacion = await useCase.execute(
        req.params.id,
        req.user.negocioId
      );

      if (!conversacion) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Conversación no encontrada.',
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Control tomado.',
        conversacion: mapConversacionDetalle(conversacion),
      });
    } catch (error) {
      console.error('Error tomando control de conversación:', error);

      return res.status(500).json({
        ok: false,
        mensaje:
          error instanceof Error
            ? error.message
            : 'Error interno tomando control de conversación.',
      });
    }
  };
}
